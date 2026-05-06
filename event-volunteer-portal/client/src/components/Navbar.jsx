import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useRef, useState } from 'react';
import { Bell, LogOut, User, Menu, X, Zap, CalendarDays, LayoutDashboard, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext.jsx';
import { fromNow } from '../utils/format';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [openBell, setOpenBell] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const bellRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(({ data }) => setNotifs(data.notifications || [])).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;
    const onNotif = (n) => setNotifs((prev) => [n, ...prev].slice(0, 50));
    socket.on('notification', onNotif);
    return () => socket.off('notification', onNotif);
  }, [socket, user]);

  useEffect(() => {
    const h = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setOpenBell(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const unread = notifs.filter((n) => !n.read).length;

  const markAll = async () => {
    await api.put('/notifications/read-all');
    setNotifs((p) => p.map((n) => ({ ...n, read: true })));
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
    }`;

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-lg tracking-tight">EVP</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 -mt-0.5">Volunteer Portal</div>
          </div>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-1">
            {user.role === 'student' && (
              <>
                <NavLink to="/events" className={navLinkClass}>
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4"/>Events</span>
                </NavLink>
                <NavLink to="/my-applications" className={navLinkClass}>
                  <span className="inline-flex items-center gap-1.5"><User className="w-4 h-4"/>My Applications</span>
                </NavLink>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <NavLink to="/admin" end className={navLinkClass}>
                  <span className="inline-flex items-center gap-1.5"><LayoutDashboard className="w-4 h-4"/>Dashboard</span>
                </NavLink>
                <NavLink to="/admin/events" className={navLinkClass}>
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4"/>Events</span>
                </NavLink>
                <NavLink to="/admin/applications" className={navLinkClass}>
                  <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4"/>Applications</span>
                </NavLink>
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="relative" ref={bellRef}>
                <button
                  onClick={() => setOpenBell((v) => !v)}
                  className="relative p-2 rounded-lg hover:bg-white/5 transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-zinc-300" />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-ink-950" />
                  )}
                </button>
                <AnimatePresence>
                  {openBell && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-80 glass-strong p-2 shadow-xl"
                    >
                      <div className="flex items-center justify-between px-2 py-1.5">
                        <div className="font-semibold text-sm">Notifications</div>
                        {unread > 0 && (
                          <button onClick={markAll} className="text-xs text-violet-300 hover:text-violet-200">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-auto">
                        {notifs.length === 0 ? (
                          <div className="px-3 py-6 text-center text-zinc-500 text-sm">No notifications yet</div>
                        ) : (
                          notifs.map((n) => (
                            <div
                              key={n._id}
                              className={`px-3 py-2.5 rounded-lg ${n.read ? '' : 'bg-violet-500/5'} hover:bg-white/5 cursor-pointer`}
                              onClick={() => n.link && navigate(n.link)}
                            >
                              <div className="flex items-start gap-2">
                                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  n.type === 'success' ? 'bg-emerald-400' :
                                  n.type === 'warning' ? 'bg-amber-400' :
                                  n.type === 'error' ? 'bg-red-400' : 'bg-violet-400'
                                }`}/>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-zinc-100">{n.title}</div>
                                  <div className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{n.message}</div>
                                  <div className="text-[10px] text-zinc-500 mt-1">{fromNow(n.createdAt)}</div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative hidden md:block" ref={menuRef}>
                <button
                  onClick={() => setOpenMenu((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs text-zinc-300 leading-tight">{user.name}</div>
                    <div className="text-[10px] text-zinc-500 leading-tight uppercase tracking-wider">{user.role}</div>
                  </div>
                </button>
                <AnimatePresence>
                  {openMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-48 glass-strong p-2 shadow-xl"
                    >
                      <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-zinc-500">{user.email}</div>
                      </div>
                      <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-red-500/10"
                      >
                        <LogOut className="w-4 h-4"/> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                className="md:hidden p-2 rounded-lg hover:bg-white/5"
                onClick={() => setOpenMobile(true)}
              >
                <Menu className="w-5 h-5"/>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Sign in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {openMobile && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink-950/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex items-center justify-between px-4 h-16 border-b border-white/5">
              <div className="font-display font-bold">EVP</div>
              <button onClick={() => setOpenMobile(false)} className="p-2 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-4 space-y-2">
              {user.role === 'student' && (
                <>
                  <Link to="/events" onClick={() => setOpenMobile(false)} className="block px-4 py-3 glass">Events</Link>
                  <Link to="/my-applications" onClick={() => setOpenMobile(false)} className="block px-4 py-3 glass">My Applications</Link>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" onClick={() => setOpenMobile(false)} className="block px-4 py-3 glass">Dashboard</Link>
                  <Link to="/admin/events" onClick={() => setOpenMobile(false)} className="block px-4 py-3 glass">Events</Link>
                  <Link to="/admin/applications" onClick={() => setOpenMobile(false)} className="block px-4 py-3 glass">Applications</Link>
                </>
              )}
              <button
                onClick={() => { logout(); setOpenMobile(false); navigate('/login'); }}
                className="w-full text-left px-4 py-3 glass text-red-300"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
