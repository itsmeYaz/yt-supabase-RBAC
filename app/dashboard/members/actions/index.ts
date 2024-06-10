'use server'

import { readUserSession } from '@/lib/actions'
import { createSupabaseAdmin, createSupbaseServerClient } from '@/lib/supabase'
import { unstable_noStore } from 'next/cache'

export async function createMember(data: {
  name: string
  role: 'user' | 'admin'
  status: 'active' | 'resigned'
  email: string
  password: string
  confirm: string
}) {
  //prevent a non admin to access admin privillage
  const { data: userSession } = await readUserSession()
  if (userSession.session?.user.user_metadata.role !== 'admin') {
    return JSON.stringify({
      error: { message: "You don't have the admin privillage" },
    })
  }

  const supabase = await createSupabaseAdmin()
  //create account
  const createResult = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      role: data.role,
    },
  })

  if (createResult.error?.message) {
    return JSON.stringify(createResult)
  } else {
    const memberResult = await supabase
      .from('member')
      .insert({ name: data.name, id: createResult.data.user?.id })
    if (memberResult.error?.message) {
      return JSON.stringify(memberResult)
    } else {
      const permissionReult = await supabase.from('permission').insert({
        role: data.role,
        member_id: createResult.data.user?.id,
        status: data.status,
      })
      return JSON.stringify(permissionReult)
    }
  }
  //create member
  //create permission
}
export async function updateMemberById(id: string) {
  console.log('update member')
}
export async function deleteMemberById(id: string) {}

export async function readMembers() {
  unstable_noStore()

  const supabase = await createSupbaseServerClient()
  return await supabase.from('permission').select('*,member(*)')
}
