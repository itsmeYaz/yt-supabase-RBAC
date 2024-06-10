'use server'

import { createSupabaseAdmin } from '@/lib/supabase'

export async function createMember(data: {
  name: string
  role: 'user' | 'admin'
  status: 'active' | 'resigned'
  email: string
  password: string
  confirm: string
}) {
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
export async function readMembers() {}
