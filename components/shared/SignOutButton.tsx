export default function SignOutButton({ className = "rounded-lg px-3 py-3 text-sm font-semibold text-blue-700" }: { className?: string }) {
  return <form action="/auth/sign-out" method="post"><button type="submit" className={className}>Sign out</button></form>;
}
