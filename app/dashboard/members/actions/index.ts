'use server'

import { readUserSession } from '@/lib/actions'
import { createSupabaseAdmin, createSupbaseServerClient } from '@/lib/supabase'
import { revalidatePath, unstable_noStore } from 'next/cache'

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

      revalidatePath('/dashboard/member')
      return JSON.stringify(permissionReult)
    }
  }
  //create member
  //create permission
}
export async function updateMemberById(id: string) {
  console.log('update member')
}
export async function deleteMemberById(user_id: string) {
  //admin only
  const { data: userSession } = await readUserSession()
  if (userSession.session?.user.user_metadata.role !== 'admin') {
    return JSON.stringify({
      error: { message: "You don't have the admin privillage" },
    })
  }

  //delte account
  const supabaseAdmin = await createSupabaseAdmin()

  const deleteResult = await supabaseAdmin.auth.admin.deleteUser(user_id)

  if (deleteResult.error?.message) {
    return JSON.stringify(deleteResult)
  } else {
    //pwede dito SupabaseAdmin na pang query para di na maga add ng policy
    const supabase = await createSupbaseServerClient()
    const result = await supabase.from('member').delete().eq('id', user_id)
    revalidatePath('/dashboard/member')
    return JSON.stringify(result)
  }
}

export async function readMembers() {
  unstable_noStore()

  const supabase = await createSupbaseServerClient()
  return await supabase.from('permission').select('*,member(*)')
}
