import { useSignUp } from '@clerk/clerk-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const signUpSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type SignUpData = z.infer<typeof signUpSchema>

const verifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
})
type VerifyData = z.infer<typeof verifySchema>

export function SignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const navigate = useNavigate()
  const [step, setStep] = useState<'register' | 'verify'>('register')

  const signUpForm = useForm<SignUpData>({ resolver: zodResolver(signUpSchema) })
  const verifyForm = useForm<VerifyData>({ resolver: zodResolver(verifySchema) })

  async function onSignUp(data: SignUpData) {
    if (!isLoaded) return
    try {
      await signUp.create({
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: data.email,
        password: data.password,
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setStep('verify')
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] }
      signUpForm.setError('root', {
        message: clerkErr.errors?.[0]?.message ?? 'Something went wrong.',
      })
    }
  }

  async function onVerify(data: VerifyData) {
    if (!isLoaded) return
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: data.code })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        navigate('/')
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] }
      verifyForm.setError('root', {
        message: clerkErr.errors?.[0]?.message ?? 'Invalid code.',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground text-sm mt-1">Start tracking your job search</p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          {step === 'register' ? (
            <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" placeholder="John" {...signUpForm.register('firstName')} />
                  {signUpForm.formState.errors.firstName && (
                    <p className="text-destructive text-xs">{signUpForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" placeholder="Doe" {...signUpForm.register('lastName')} />
                  {signUpForm.formState.errors.lastName && (
                    <p className="text-destructive text-xs">{signUpForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...signUpForm.register('email')} />
                {signUpForm.formState.errors.email && (
                  <p className="text-destructive text-xs">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" {...signUpForm.register('password')} />
                {signUpForm.formState.errors.password && (
                  <p className="text-destructive text-xs">{signUpForm.formState.errors.password.message}</p>
                )}
              </div>

              {signUpForm.formState.errors.root && (
                <p className="text-destructive text-sm text-center">{signUpForm.formState.errors.root.message}</p>
              )}

              <Button type="submit" className="w-full" disabled={signUpForm.formState.isSubmitting}>
                {signUpForm.formState.isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyForm.handleSubmit(onVerify)} className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Check your email</p>
                <p className="text-muted-foreground text-xs">We sent a 6-digit code to your email address.</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="code">Verification code</Label>
                <Input id="code" placeholder="123456" maxLength={6} {...verifyForm.register('code')} />
                {verifyForm.formState.errors.code && (
                  <p className="text-destructive text-xs">{verifyForm.formState.errors.code.message}</p>
                )}
              </div>

              {verifyForm.formState.errors.root && (
                <p className="text-destructive text-sm text-center">{verifyForm.formState.errors.root.message}</p>
              )}

              <Button type="submit" className="w-full" disabled={verifyForm.formState.isSubmitting}>
                {verifyForm.formState.isSubmitting ? 'Verifying...' : 'Verify email'}
              </Button>

              <button
                type="button"
                onClick={() => setStep('register')}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                Go back
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
