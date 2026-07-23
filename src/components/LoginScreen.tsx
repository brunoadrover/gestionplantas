import React, { useState, useEffect } from 'react';
import { UserLog } from '../types';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Lock, User, AlertCircle, Loader2, RefreshCw, Edit3, List } from 'lucide-react';

interface LoginScreenProps {
  users: UserLog[];
  onLogin: (user: UserLog) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [logUsers, setLogUsers] = useState<UserLog[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isFetchingUsers, setIsFetchingUsers] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchLiveLogUsers = async () => {
    setIsFetchingUsers(true);
    setError(null);
    try {
      // Clear legacy mock cache if present
      const cached = localStorage.getItem('geyt_table_log');
      if (cached && (cached.includes('u-geyt') || cached.includes('u-admin') || cached.includes('u-operador'))) {
        localStorage.removeItem('geyt_table_log');
      }

      const { data, error: dbError } = await supabase.from('log').select('*');
      if (!dbError && data && data.length > 0) {
        const mapped: UserLog[] = data.map((item: any, idx: number) => ({
          id: item.id ? String(item.id) : item.id_log ? String(item.id_log) : item.usuario ? String(item.usuario) : `log-${idx}`,
          usuario: String(item.usuario || '').trim(),
          pass: String(item.pass || '').trim(),
          rol: String(item.rol || 'USER').trim().toUpperCase(),
          id_planta: item.id_planta,
        }));

        setLogUsers(mapped);
        if (mapped.length > 0) {
          setSelectedUsername(mapped[0].usuario);
        }
      } else {
        if (dbError) {
          console.warn('Supabase query error on "log" table:', dbError);
        }
        // Filter prop users to eliminate any mock IDs
        const realPropUsers = users.filter((u) => !u.id?.startsWith('u-geyt') && !u.id?.startsWith('u-admin') && !u.id?.startsWith('u-operador'));
        setLogUsers(realPropUsers);
        if (realPropUsers.length > 0) {
          setSelectedUsername(realPropUsers[0].usuario);
        } else {
          setManualMode(true);
        }
      }
    } catch (err) {
      console.error('Error fetching table "log":', err);
      const realPropUsers = users.filter((u) => !u.id?.startsWith('u-geyt') && !u.id?.startsWith('u-admin') && !u.id?.startsWith('u-operador'));
      setLogUsers(realPropUsers);
      if (realPropUsers.length > 0) {
        setSelectedUsername(realPropUsers[0].usuario);
      } else {
        setManualMode(true);
      }
    } finally {
      setIsFetchingUsers(false);
    }
  };

  useEffect(() => {
    fetchLiveLogUsers();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedUsername.trim()) {
      setError('Por favor ingrese un nombre de usuario.');
      return;
    }
    setIsLoading(true);

    try {
      // 1. Direct query to Supabase table "log" for the selected username
      const { data: dbRows, error: dbError } = await supabase.from('log').select('*');
      
      let matchedUser: UserLog | null = null;

      if (!dbError && dbRows && dbRows.length > 0) {
        const dbFound = dbRows.find(
          (r: any) => r.usuario && String(r.usuario).trim().toLowerCase() === selectedUsername.trim().toLowerCase()
        );
        if (dbFound) {
          matchedUser = {
            id: dbFound.id ? String(dbFound.id) : String(dbFound.usuario),
            usuario: String(dbFound.usuario).trim(),
            pass: String(dbFound.pass).trim(),
            rol: String(dbFound.rol || 'USER').trim().toUpperCase(),
            id_planta: dbFound.id_planta,
          };
        }
      }

      // 2. Fallback to in-memory logUsers list
      if (!matchedUser) {
        matchedUser = logUsers.find(
          (u) => u.usuario.trim().toLowerCase() === selectedUsername.trim().toLowerCase()
        ) || null;
      }

      if (!matchedUser) {
        setError(`El usuario "${selectedUsername}" no existe en la tabla "log".`);
        setIsLoading(false);
        return;
      }

      // 3. Validate password with 'pass' field from table "log"
      if (password.trim() === matchedUser.pass.trim()) {
        onLogin(matchedUser);
      } else {
        setError('Contraseña incorrecta. Verifique la clave ingresada.');
      }
    } catch (err) {
      console.error('Error in login validation:', err);
      const fallback = logUsers.find((u) => u.usuario.toLowerCase() === selectedUsername.toLowerCase());
      if (fallback && password.trim() === fallback.pass.trim()) {
        onLogin(fallback);
      } else {
        setError('Contraseña incorrecta o error de verificación.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-white text-slate-900 border-2 border-slate-200 shadow-[8px_8px_0px_#1e293b] p-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">
            Gerencia de Equipos y Transporte
          </h1>
          <div className="h-0.5 w-16 bg-blue-600 my-2"></div>
          <p className="text-blue-600 font-extrabold text-[10px] tracking-[0.2em] uppercase">
            Gestión de Plantas
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 text-red-800 text-xs font-bold flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
                Usuario Registrado
              </label>
              <button
                type="button"
                onClick={() => setManualMode(!manualMode)}
                className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {manualMode ? (
                  <>
                    <List className="w-3 h-3" />
                    <span>Seleccionar de lista</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3 h-3" />
                    <span>Escribir nombre</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>

              {manualMode ? (
                <input
                  type="text"
                  placeholder="Escriba su usuario exacto"
                  value={selectedUsername}
                  onChange={(e) => {
                    setSelectedUsername(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-600 transition-colors"
                  required
                />
              ) : isFetchingUsers ? (
                <div className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 text-slate-500 font-bold text-xs flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Cargando usuarios de tabla "log"...</span>
                </div>
              ) : logUsers.length > 0 ? (
                <select
                  value={selectedUsername}
                  onChange={(e) => {
                    setSelectedUsername(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-600 transition-colors"
                >
                  {logUsers.map((u, idx) => (
                    <option key={u.id || idx} value={u.usuario}>
                      {u.usuario} ({u.rol === 'ADMIN' ? 'Administrador' : `Rol ${u.rol}`})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Ingrese su nombre de usuario"
                  value={selectedUsername}
                  onChange={(e) => {
                    setSelectedUsername(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-600 transition-colors"
                  required
                />
              )}
            </div>

            <div className="flex items-center justify-between mt-1.5 px-0.5">
              <p className="text-[10px] text-slate-400 font-medium">
                {logUsers.length > 0
                  ? `* ${logUsers.length} usuario${logUsers.length === 1 ? '' : 's'} registrado${logUsers.length === 1 ? '' : 's'} en BD.`
                  : '* Escriba el usuario registrado en la tabla "log".'}
              </p>
              <button
                type="button"
                onClick={fetchLiveLogUsers}
                className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                title="Actualizar lista de usuarios desde la base de datos"
              >
                <RefreshCw className={`w-3 h-3 ${isFetchingUsers ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5 italic">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-600 transition-colors placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isFetchingUsers}
            className="w-full py-3.5 px-4 bg-[#0f172a] hover:bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#94a3b8] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            )}
            <span>{isLoading ? 'Verificando...' : 'Ingresar al Sistema'}</span>
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-400 font-mono">
            Conexión activa con la base de datos Supabase
          </p>
        </div>
      </div>
    </div>
  );
};
