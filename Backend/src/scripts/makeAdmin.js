import { randomBytes } from 'node:crypto'
import { getAuth } from 'firebase-admin/auth'
import { app } from '../firebase.js'

const email = process.argv[2]
if (!email) {
  console.error('Pakai: npm run make-admin -- admin@email.com')
  process.exit(1)
}

const auth = getAuth(app)

let user
try {
  user = await auth.getUserByEmail(email)
} catch (err) {
  if (err.code !== 'auth/user-not-found') throw err
  const password = randomBytes(8).toString('hex')
  user = await auth.createUser({ email, password })
  console.log(`Akun dibuat: ${email}`)
  console.log(`Password sementara: ${password}`)
}

await auth.setCustomUserClaims(user.uid, { admin: true })
console.log(`Claim admin aktif untuk ${email}. Login di /admin.`)
