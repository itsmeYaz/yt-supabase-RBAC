'use server'

import { readUserSession } from '@/lib/actions'
import { createSupabaseAdmin, createSupbaseServerClient } from '@/lib/supabase'
import { revalidatePath, unstable_noStore } from 'next/cache'

//Create Member
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
    const memberResult = await supabase.from('member').insert({
      name: data.name,
      id: createResult.data.user?.id,
      email: data.email,
    })
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

//Update Basic Member
export async function updateMemberBasicsById(
  id: string,
  data: {
    name: string
  },
) {
  const supabase = await createSupbaseServerClient()

  const result = await supabase.from('member').update(data).eq('id', id)
  revalidatePath('/dashboard/member')
  return JSON.stringify(result)
}

//Update Member Advance Only admin
export async function updateMemberAdvanceById(
  permission_id: string,
  user_id: string,
  data: {
    status: 'active' | 'resigned'
    role: 'user' | 'admin'
  },
) {
  //prevent a non admin to access admin privillage
  const { data: userSession } = await readUserSession()
  if (userSession.session?.user.user_metadata.role !== 'admin') {
    return JSON.stringify({
      error: { message: "You don't have the admin privillage" },
    })
  }

  //Update user metadata
  const supabaseAdmin = await createSupabaseAdmin()
  const updateResult = await supabaseAdmin.auth.admin.updateUserById(user_id, {
    user_metadata: { role: data.role },
  })

  if (updateResult.error?.message) {
    return JSON.stringify(updateResult)
  } else {
    const supabase = await createSupbaseServerClient()
    const result = await supabase
      .from('permission')
      .update(data)
      .eq('id', permission_id)
    revalidatePath('/dashboard/member')
    return JSON.stringify(result)
  }
}

//Update Account
export async function updateMemberAccountById(
  user_id: string,
  data: {
    email: string
    password?: string | undefined
    confirm?: string | undefined
  },
) {
  //prevent a non admin to access admin privillage
  const { data: userSession } = await readUserSession()
  if (userSession.session?.user.user_metadata.role !== 'admin') {
    return JSON.stringify({
      error: { message: "You don't have the admin privillage" },
    })
  }

  const updateObject: {
    email: string
    password?: string | undefined
  } = { email: data.email }

  if (data.password) {
    updateObject['password'] = data.password
  }

  //Update user metadata
  const supabaseAdmin = await createSupabaseAdmin()
  const updateResult = await supabaseAdmin.auth.admin.updateUserById(
    user_id,
    updateObject,
  )

  if (updateResult.error?.message) {
    return JSON.stringify(updateResult)
  } else {
    //pwede dito SupabaseAdmin na pang query para di na maga add ng policy
    const supabase = await createSupbaseServerClient()
    const result = await supabase
      .from('member')
      .update({ email: data.email })
      .eq('id', user_id)
    revalidatePath('/dashboard/member')
    return JSON.stringify(result)
  }
}

//delete member
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
