import { Lock, ArrowRight } from 'lucide-react'

export default function ChangePassword() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-4 font-[Aptos,Segoe_UI,Trebuchet_MS,sans-serif]">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-prpl/8 text-prpl rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Change Password</h1>
          <p className="text-slate-500 mt-2 text-sm">Please update your password to continue.</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">New Password</label>
            <input type="password" className="h-12 w-full rounded-xl bg-white px-4 text-sm text-slate-800 outline-none border border-slate-200 transition focus:border-prpl focus:shadow-[0_0_0_2px_rgba(85,35,233,0.10)] placeholder:text-slate-400" placeholder="Enter new password" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Confirm Password</label>
            <input type="password" className="h-12 w-full rounded-xl bg-white px-4 text-sm text-slate-800 outline-none border border-slate-200 transition focus:border-prpl focus:shadow-[0_0_0_2px_rgba(85,35,233,0.10)] placeholder:text-slate-400" placeholder="Confirm new password" />
          </div>

          <button type="button" className="w-full inline-flex items-center justify-center gap-2 bg-prpl text-white font-semibold px-5 py-3 rounded-xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md mt-2">
            Update Password <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
