
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminUsersPage() {
  interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  }

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUsers(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyUser = async (id: string, isVerified: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}/verify`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ isVerified })
      });
      fetchUsers(); // Refresh
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
        <p className="text-muted-foreground mt-1">Verifikasi akun dan monitor pengguna platform.</p>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Nama / Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status Verifikasi</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Memuat data...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Tidak ada pengguna</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{u.name}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        u.role === 'PENGEPUL' ? 'bg-orange-100 text-orange-800' : 
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isVerified ? (
                        <span className="flex items-center text-emerald-600 text-xs font-medium">
                          <CheckCircle className="w-4 h-4 mr-1" /> Terverifikasi
                        </span>
                      ) : (
                        <span className="flex items-center text-muted-foreground text-xs font-medium">
                          <XCircle className="w-4 h-4 mr-1" /> Belum
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <Button 
                          variant={u.isVerified ? "outline" : "default"} 
                          size="sm"
                          className={u.isVerified ? "text-destructive hover:bg-destructive/10 hover:text-destructive" : "bg-emerald-600 hover:bg-emerald-700"}
                          onClick={() => verifyUser(u.id, !u.isVerified)}
                        >
                          {u.isVerified ? 'Batalkan Verifikasi' : 'Verifikasi Akun'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
