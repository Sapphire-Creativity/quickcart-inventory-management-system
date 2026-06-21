'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff,
  HiOutlineArrowRight, HiOutlineUser, HiOutlineShieldCheck, HiOutlineSparkles,
  HiOutlineFingerPrint, HiOutlineCheckCircle, HiOutlineExclamationCircle,
  HiOutlinePhone
} from 'react-icons/hi'
import { useRouter } from 'next/navigation'
import InputField from '@/components/ui/InputField'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signInSchema, signUpSchema } from '@/lib/schemas/auth'
import { useSignIn, useSignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────────
type AuthMode = 'signin' | 'signup'
type FormData = z.infer<typeof signUpSchema>

// ── Eye Toggle ─────────────────────────────────────────────
const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
  <button type="button" onClick={onToggle} className="text-white/40 hover:text-white/60 transition-colors">
    {show ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
  </button>
)

// ── Submit Button ──────────────────────────────────────────
const SubmitButton = ({ isLoading, label, loadingLabel }: { isLoading: boolean; label: string; loadingLabel: string }) => (
  <motion.button
    type="submit"
    disabled={isLoading}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="w-full relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity" />
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative flex items-center justify-center gap-2 py-3.5 text-white font-semibold">
      {isLoading ? (
        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>{loadingLabel}</span></>
      ) : (
        <><span>{label}</span><HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
      )}
    </div>
  </motion.button>
)

// ── Main Component ─────────────────────────────────────────
export default function HomePageInner() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { signUp } = useSignUp()
  const { signIn } = useSignIn()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') ?? '/dashboard'

  const modeRef = useRef(mode)
  modeRef.current = mode

  const {
    control,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: ((data: any, context: any, options: any) => {
      const schema = modeRef.current === 'signin' ? signInSchema : signUpSchema
      return zodResolver(schema)(data, context, options)
    }) as any,
    defaultValues: {
      email: '', password: '', rememberMe: false,
      fullName: '', phone: '', confirmPassword: '', storeName: '', agreeTerms: false,
    },
  })

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setErrorMessage('')
    reset()
  }

  const onSubmit = async (data: FormData) => {
    setErrorMessage('')

    // ── SIGN IN ────────────────────────────────────────────
    if (mode === 'signin') {
      if (!signIn) return
      const toastId = toast.loading('Signing in...')

      try {
        const { error } = await signIn.password({
          emailAddress: data.email,
          password: data.password,
        })

        if (error) {
          toast.dismiss(toastId)
          setErrorMessage((error as any).errors?.[0]?.longMessage ?? 'Invalid email or password.')
          return
        }

        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            toast.success('Welcome back!', { id: toastId, duration: 2000 })
            setShowSuccess(true)
            setTimeout(() => {
              router.replace(decorateUrl(redirectUrl))
            }, 1000)
          },
        })

      } catch (err: any) {
        toast.dismiss(toastId)
        setErrorMessage(err.errors?.[0]?.longMessage ?? 'Invalid email or password.')
      }
    }

    // ── SIGN UP ────────────────────────────────────────────
    else {
      if (!signUp) return
      const toastId = toast.loading('Creating your account...')

      try {
        const { error } = await signUp.password({
          emailAddress: data.email,
          password: data.password,
          firstName: data.fullName.split(' ')[0],
          lastName: data.fullName.split(' ').slice(1).join(' '),
          unsafeMetadata: {
            storeName: data.storeName
          }
        })

        if (error) {
          toast.dismiss(toastId)
          setErrorMessage((error as any).errors?.[0]?.longMessage ?? 'Something went wrong.')
          return
        }

        await signUp.verifications.sendEmailCode()

        toast.success('Check your email for a verification code.', {
          id: toastId,
          duration: 3000,
        })

        router.replace('/email-verification')

      } catch (err: any) {
        toast.dismiss(toastId)
        setErrorMessage(err.errors?.[0]?.longMessage ?? 'Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-emerald-950">
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-8"
      >
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Left — Branding */}
            <div className="hidden lg:block space-y-8">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <HiOutlineSparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">QuickCart</h1>
                  <p className="text-white/60 text-sm">Admin Dashboard</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="space-y-4">
                <h2 className="text-4xl font-bold text-white leading-tight">
                  {mode === 'signin' ? <>Welcome back to<br /></> : <>Start your<br /></>}
                  <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                    {mode === 'signin' ? 'your command center' : 'e-commerce journey'}
                  </span>
                </h2>
                <p className="text-white/70 text-lg">
                  {mode === 'signin'
                    ? 'Manage your e-commerce empire with our powerful dashboard tools.'
                    : 'Create your admin account and start managing your store in minutes.'}
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center gap-4 text-white/50 text-sm">
                <div className="flex items-center gap-2"><HiOutlineShieldCheck className="w-4 h-4" /><span>256-bit SSL encrypted</span></div>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2"><HiOutlineCheckCircle className="w-4 h-4" /><span>SOC 2 compliant</span></div>
              </motion.div>
            </div>

            {/* Right — Auth Card */}
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden">


                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="lg:hidden flex justify-center mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                        <HiOutlineSparkles className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {mode === 'signin' ? 'Admin Access' : 'Create Account'}
                    </h2>
                    <p className="text-white/60">
                      {mode === 'signin' ? 'Sign in to manage your dashboard' : 'Get started with your free admin account'}
                    </p>
                  </div>

                  {/* Error Banner */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2">
                        <HiOutlineExclamationCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-400 text-sm">{errorMessage}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success Overlay */}
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-md rounded-3xl flex items-center justify-center z-10">
                        <div className="text-center">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                            <HiOutlineCheckCircle className="w-10 h-10 text-white" />
                          </motion.div>
                          <p className="text-white font-semibold">{mode === 'signin' ? 'Login successful!' : 'Account created!'}</p>
                          <p className="text-white/60 text-sm">{mode === 'signin' ? 'Redirecting to dashboard...' : 'Redirecting...'}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Forms */}
                  <AnimatePresence mode="wait">
                    {mode === 'signin' ? (
                      <motion.form key="signin" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }} onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        <Controller name="email" control={control} render={({ field }) => (
                          <InputField {...field} label="Email Address" icon={HiOutlineMail} type="email"
                            placeholder="admin@example.com" error={errors.email?.message} />
                        )} />

                        <Controller name="password" control={control} render={({ field }) => (
                          <InputField {...field} label="Password" icon={HiOutlineLockClosed}
                            type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                            error={errors.password?.message}
                            rightElement={<EyeToggle show={showPassword} onToggle={() => setShowPassword(p => !p)} />} />
                        )} />

                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" {...register('rememberMe')}
                              className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-emerald-500 checked:border-emerald-500 focus:ring-emerald-500 focus:ring-offset-0" />
                            <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">Remember me</span>
                          </label>
                          <button type="button" className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">Forgot password?</button>
                        </div>

                        <SubmitButton isLoading={isSubmitting} label="Sign In" loadingLabel="Signing In..." />
                        <p className="text-white/50 text-sm text-center">
                          Don&apos;t have an account?{' '}
                          <button type="button" onClick={() => switchMode('signup')} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Create Account</button>
                        </p>
                      </motion.form>

                    ) : (
                      <motion.form key="signup" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }} onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4">

                        <Controller name="fullName" control={control} render={({ field }) => (
                          <InputField {...field} label="Full Name" icon={HiOutlineUser}
                            placeholder="John Doe" error={errors.fullName?.message} />
                        )} />

                        <Controller name="email" control={control} render={({ field }) => (
                          <InputField {...field} label="Email Address" icon={HiOutlineMail} type="email"
                            placeholder="admin@example.com" error={errors.email?.message} />
                        )} />

                        <Controller name="phone" control={control} render={({ field }) => (
                          <InputField {...field} label="Phone Number" icon={HiOutlinePhone} type="tel"
                            placeholder="+1 (555) 123-4567" error={errors.phone?.message} />
                        )} />

                        <Controller name="storeName" control={control} render={({ field }) => (
                          <InputField {...field} label="Store Name" icon={HiOutlineFingerPrint}
                            placeholder="My Awesome Store" error={errors.storeName?.message} />
                        )} />

                        <Controller name="password" control={control} render={({ field }) => (
                          <InputField {...field} label="Password" icon={HiOutlineLockClosed}
                            type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                            error={errors.password?.message}
                            rightElement={<EyeToggle show={showPassword} onToggle={() => setShowPassword(p => !p)} />} />
                        )} />

                        <Controller name="confirmPassword" control={control} render={({ field }) => (
                          <InputField {...field} label="Confirm Password" icon={HiOutlineLockClosed}
                            type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••"
                            error={errors.confirmPassword?.message}
                            rightElement={<EyeToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword(p => !p)} />} />
                        )} />

                        <div>
                          <label className="flex items-start gap-2 cursor-pointer group">
                            <input type="checkbox" {...register('agreeTerms')}
                              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-emerald-500 checked:border-emerald-500 focus:ring-emerald-500" />
                            <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
                              I agree to the{' '}
                              <button type="button" className="text-emerald-400 hover:text-emerald-300">Terms of Service</button>
                              {' '}and{' '}
                              <button type="button" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</button>
                            </span>
                          </label>
                          {errors.agreeTerms && <p className="text-red-400 text-xs mt-1">{errors.agreeTerms.message}</p>}
                        </div>



                        <SubmitButton isLoading={isSubmitting} label="Create Account" loadingLabel="Creating Account..." />
                        <p className="text-white/50 text-sm text-center">
                          Already have an account?{' '}
                          <button type="button" onClick={() => switchMode('signin')} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Sign In</button>
                        </p>
                      </motion.form>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
      `}</style>
    </div>
  )
}