import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const userDoc = uid => doc(db, 'users', uid)
const categoriesCol = uid => collection(db, 'users', uid, 'categories')
const transactionsCol = uid => collection(db, 'users', uid, 'transactions')

/** Load one user's profile, categories and transactions without inserting sample data. */
export async function loadUserData(firebaseUser) {
  const uid = firebaseUser.uid
  const profileRef = userDoc(uid)
  const [profileSnap, categorySnap, transactionSnap] = await Promise.all([
    getDoc(profileRef),
    getDocs(categoriesCol(uid)),
    getDocs(transactionsCol(uid)),
  ])

  // Never seed demo categories or transactions into a real user's account.
  const categories = categorySnap.docs.map(item => ({ ...item.data(), id: item.id }))
  const transactions = transactionSnap.docs.map(item => ({ ...item.data(), id: item.id }))
  const profile = profileSnap.exists() ? profileSnap.data() : {}

  await setDoc(profileRef, {
    uid,
    name: firebaseUser.displayName || profile.name || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    salary: Number.isFinite(profile.salary) ? profile.salary : 0,
    createdAt: profile.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true })

  return {
    categories,
    transactions,
    salary: Number.isFinite(profile.salary) ? profile.salary : 0,
  }
}

/** Sync the user's complete current state; stale category/transaction docs are removed. */
export async function saveUserData({ user, categories, transactions, salary }) {
  if (!user?.uid) throw new Error('You must be signed in to save SmartSpend data.')
  const uid = user.uid
  const [existingCategories, existingTransactions] = await Promise.all([
    getDocs(categoriesCol(uid)),
    getDocs(transactionsCol(uid)),
  ])

  const batch = writeBatch(db)
  const categoryIds = new Set(categories.map(item => String(item.id)))
  const transactionIds = new Set(transactions.map(item => String(item.id)))

  existingCategories.docs.forEach(item => {
    if (!categoryIds.has(item.id)) batch.delete(item.ref)
  })
  existingTransactions.docs.forEach(item => {
    if (!transactionIds.has(item.id)) batch.delete(item.ref)
  })

  categories.forEach(item => {
    const { id, ...data } = item
    batch.set(doc(categoriesCol(uid), String(id)), data)
  })
  transactions.forEach(item => {
    const { id, ...data } = item
    batch.set(doc(transactionsCol(uid), String(id)), data)
  })

  batch.set(userDoc(uid), {
    uid,
    name: user.name || '',
    email: user.email || '',
    salary: Number(salary) || 0,
    updatedAt: serverTimestamp(),
  }, { merge: true })

  await batch.commit()
}
