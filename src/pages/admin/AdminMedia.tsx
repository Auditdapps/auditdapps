export default function AdminMedia() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Media</h1>
      <p className="text-sm text-slate-600">
        Optional: a lightweight media library for blog covers/author avatars.
        For now, use direct URLs or upload to Supabase Storage and paste the public URL.
      </p>
    </div>
  );
}
