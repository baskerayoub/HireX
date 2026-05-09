import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Access Denied</h1>
        <p className="text-slate-500 mb-8">
          You don't have the necessary permissions to view this page. Contact your administrator if you believe this is a mistake.
        </p>
        <Link to="/workspace" className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-prpl/40 hover:text-prpl transition">
          <ArrowLeft className="w-4 h-4" /> Return to Workspace
        </Link>
      </div>
    </div>
  )
}
