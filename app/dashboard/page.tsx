import { createClient } from '@supabase/supabase-js';

// Pakai baris ini di paling atas untuk memastikan tidak di-cache sebagai statis
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Pindahkan inisialisasi ke sini agar dievaluasi saat runtime
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return <p>Error: Environment variables Supabase belum terkonfigurasi di Vercel.</p>;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: logs, error } = await supabase
    .from('sensor_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return <p>Gagal mengambil data: {error.message}</p>;

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-white">Monitoring Sensor ESP32-S3</h1>
      
      <div className="overflow-x-auto border border-gray-700 rounded-lg">
        <table className="min-w-full bg-slate-900 text-white">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left">Waktu</th>
              <th className="px-6 py-3 text-left">Tipe Sensor</th>
              <th className="px-6 py-3 text-left">Nilai (Value)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {logs?.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800 transition-colors">
                <td className="px-6 py-4">
                  {new Date(log.created_at).toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 font-medium">{log.sensor_type}</td>
                <td className="px-6 py-4 text-cyan-400 font-bold">
                  {log.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}