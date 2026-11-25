param(
    [switch]$PrepararApenas,
    [ValidateRange(1024, 65535)]
    [int]$Porta = 8081,
    [string]$IP
)

$ErrorActionPreference = 'Stop'
$origem = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$workspace = Split-Path -Parent (Split-Path -Parent $origem)
$ferramentas = Join-Path $workspace '.sail-tools'
$temporario = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\')
$baseExecucao = [IO.Path]::GetFullPath((Join-Path $temporario 'SailRuntime'))
$destino = Join-Path $baseExecucao 'frontend'
$marcador = Join-Path $baseExecucao 'origem.json'
$hashDependencias = Join-Path $baseExecucao 'dependencias.sha256'

function Validar-IP([string]$Endereco) {
    $analisado = $null
    if ($Endereco -notmatch '^\d{1,3}(?:\.\d{1,3}){3}$' -or
        ![Net.IPAddress]::TryParse($Endereco, [ref]$analisado) -or
        $analisado.AddressFamily -ne [Net.Sockets.AddressFamily]::InterNetwork -or
        $analisado.Equals([Net.IPAddress]::Any) -or $analisado.Equals([Net.IPAddress]::Broadcast)) {
        throw 'Informe um endereço IPv4 válido para -IP.'
    }
    return $analisado.ToString()
}

function Obter-IPLocal {
    try {
        $rede = Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq 'Up' } |
            Sort-Object { $_.NetIPv4Interface.InterfaceMetric } | Select-Object -First 1
        $detectado = @($rede.IPv4Address.IPAddress)[0]
        if ($detectado) { return Validar-IP $detectado }
    } catch {
        Write-Verbose ('A consulta de rede do Windows não ficou disponível: ' + $_.Exception.Message)
    }
    $enderecos = foreach ($interface in [Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces()) {
        if ($interface.OperationalStatus -ne [Net.NetworkInformation.OperationalStatus]::Up -or
            $interface.NetworkInterfaceType -in @([Net.NetworkInformation.NetworkInterfaceType]::Loopback, [Net.NetworkInformation.NetworkInterfaceType]::Tunnel)) { continue }
        $propriedades = $interface.GetIPProperties()
        $possuiGateway = @($propriedades.GatewayAddresses | Where-Object {
            $_.Address.AddressFamily -eq [Net.Sockets.AddressFamily]::InterNetwork -and !$_.Address.Equals([Net.IPAddress]::Any)
        }).Count -gt 0
        foreach ($unicast in $propriedades.UnicastAddresses) {
            $endereco = $unicast.Address
            if ($endereco.AddressFamily -ne [Net.Sockets.AddressFamily]::InterNetwork -or
                [Net.IPAddress]::IsLoopback($endereco) -or $endereco.Equals([Net.IPAddress]::Any) -or
                $endereco.ToString().StartsWith('169.254.')) { continue }
            [pscustomobject]@{ IP = $endereco.ToString(); Gateway = $possuiGateway; Interface = $interface.Name }
        }
    }
    $selecionado = $enderecos | Sort-Object @{ Expression = 'Gateway'; Descending = $true }, Interface, IP | Select-Object -First 1
    if ($selecionado) { return $selecionado.IP }
    return '127.0.0.1'
}

if (!(Test-Path -LiteralPath (Join-Path $origem 'package-lock.json'))) {
    throw 'O frontend original não foi encontrado.'
}
$ipLocal = if ($IP) { Validar-IP $IP.Trim() } else { Obter-IPLocal }
if ([Net.IPAddress]::IsLoopback([Net.IPAddress]::Parse($ipLocal))) {
    Write-Warning 'A execução ficará disponível apenas neste computador. Para usar o Expo Go no celular, conecte ambos à mesma rede e informe -IP com o endereço dessa rede.'
}
if (!$PrepararApenas -and @([Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Where-Object Port -eq $Porta).Count) {
    throw "A porta $Porta já está ocupada. Encerre o Expo anterior antes de iniciar novamente."
}
[void][IO.Directory]::CreateDirectory($ferramentas)

if ($baseExecucao -match '(?i)\\OneDrive(?:\\|$)' -or $baseExecucao -eq $origem) {
    throw 'A pasta de execução precisa ficar fora do OneDrive e dos arquivos originais.'
}
if (Test-Path -LiteralPath $baseExecucao) {
    if ((Get-Item -LiteralPath $baseExecucao -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) {
        throw 'A pasta de execução não pode ser um link.'
    }
    if (!(Test-Path -LiteralPath $marcador)) {
        throw 'A pasta de execução já existe e não foi identificada como uma cópia deste projeto.'
    }
    $registro = Get-Content -LiteralPath $marcador -Raw | ConvertFrom-Json
    if ($registro.origem -ne $origem) { throw 'A pasta de execução pertence a outro projeto.' }
} else {
    [void][IO.Directory]::CreateDirectory($baseExecucao)
    [IO.File]::WriteAllText($marcador, (@{ origem = $origem } | ConvertTo-Json), [Text.UTF8Encoding]::new($false))
}

function Confirmar-Destino {
    $resolvido = [IO.Path]::GetFullPath($destino).TrimEnd('\')
    $esperado = [IO.Path]::GetFullPath((Join-Path $temporario 'SailRuntime\frontend')).TrimEnd('\')
    if (!$resolvido.Equals($esperado, [StringComparison]::OrdinalIgnoreCase) -or $resolvido -eq $origem) {
        throw 'O destino de sincronização não corresponde à cópia temporária esperada.'
    }
    foreach ($pasta in @($destino, (Join-Path $destino 'node_modules'))) {
        if ((Test-Path -LiteralPath $pasta) -and ((Get-Item -LiteralPath $pasta -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) {
            throw 'O destino de sincronização contém um link inesperado.'
        }
    }
    $registroAtual = Get-Content -LiteralPath $marcador -Raw | ConvertFrom-Json
    if ($registroAtual.origem -ne $origem) { throw 'O marcador da cópia de execução foi alterado.' }
}

Confirmar-Destino
& robocopy.exe $origem $destino /MIR /COPY:DT /DCOPY:DT /R:1 /W:1 /NFL /NDL /NP /XJ /XD .git .expo node_modules dist /XF .env '.env.*' *> (Join-Path $ferramentas 'frontend-sincronizacao.log')
if ($LASTEXITCODE -ge 8) { throw 'Falha ao sincronizar a cópia de execução. Consulte .sail-tools/frontend-sincronizacao.log.' }

$hashAtual = (Get-FileHash -LiteralPath (Join-Path $origem 'package-lock.json') -Algorithm SHA256).Hash
$hashAnterior = if (Test-Path -LiteralPath $hashDependencias) { [IO.File]::ReadAllText($hashDependencias).Trim() } else { '' }
if ($hashAtual -ne $hashAnterior -or !(Test-Path -LiteralPath (Join-Path $destino 'node_modules\expo\bin\cli'))) {
    Confirmar-Destino
    $npmCli = Join-Path (Split-Path (Get-Command npm.cmd).Source -Parent) 'node_modules\npm\bin\npm-cli.js'
    $parametrosInstalacao = @{
        FilePath = (Get-Command node.exe).Source
        ArgumentList = @(('"' + $npmCli + '"'), 'ci', '--prefer-offline', '--no-audit', '--no-fund', '--cache', ('"' + (Join-Path $ferramentas 'npm-cache') + '"'))
        WorkingDirectory = $destino
        WindowStyle = 'Hidden'
        RedirectStandardOutput = Join-Path $ferramentas 'frontend-dependencias.log'
        RedirectStandardError = Join-Path $ferramentas 'frontend-dependencias-erro.log'
        Wait = $true
        PassThru = $true
    }
    $instalacao = Start-Process @parametrosInstalacao
    if ($instalacao.ExitCode -ne 0) { throw 'Falha ao preparar as dependências. Consulte .sail-tools/frontend-dependencias-erro.log.' }
    [IO.File]::WriteAllText($hashDependencias, $hashAtual, [Text.UTF8Encoding]::new($false))
}

if ($PrepararApenas) {
    [pscustomobject]@{ Origem = $origem; PastaExecucao = $destino; IP = $ipLocal; Porta = $Porta }
    exit 0
}

$iniciadorBackend = Join-Path (Split-Path -Parent $origem) 'backend\scripts\iniciar.ps1'
if (!(Test-Path -LiteralPath $iniciadorBackend)) { throw 'O iniciador do backend não foi encontrado em Sail/backend/scripts/iniciar.ps1.' }
& $iniciadorBackend -Acao Backend -IP $ipLocal
if (!$?) { throw 'O backend não ficou disponível. Confira a mensagem e os logs em .sail-tools.' }

$env:EXPO_PUBLIC_API_URL = 'http://' + $ipLocal + ':8080'
$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ipLocal
$env:EXPO_HOME = Join-Path $ferramentas 'expo-home'
$env:EXPO_OFFLINE = '1'
$env:EXPO_NO_TELEMETRY = '1'
Write-Host ('API: ' + $env:EXPO_PUBLIC_API_URL)
Write-Host ('Navegador: http://localhost:' + $Porta)
Write-Host ('Expo Go: exp://' + $ipLocal + ':' + $Porta)
Push-Location $destino
try {
    & node.exe (Join-Path $destino 'node_modules\expo\bin\cli') start --lan --port $Porta --max-workers 1
    $codigoSaida = $LASTEXITCODE
} finally { Pop-Location }
exit $codigoSaida
