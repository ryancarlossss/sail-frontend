import Constants from 'expo-constants';
import { criarClienteApi } from './clienteApi';
import { resolverEnderecoApi } from './configuracaoApi';

const enderecoApi = resolverEnderecoApi(process.env.EXPO_PUBLIC_API_URL, Constants.expoConfig?.hostUri, __DEV__, 'http://192.168.0.101:8080');
export const cliente = criarClienteApi(enderecoApi, Constants.sessionId);
export const api = cliente.http;
