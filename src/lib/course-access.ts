import type { SupabaseClient } from '@supabase/supabase-js'
import type { AppRole } from './admin-auth'

/** Un alumno entra a un curso solo con una inscripción vigente. El staff entra para revisarlo. */
export async function hasCourseAccess(db: SupabaseClient, userId: string, role: AppRole, courseId: string): Promise<boolean> {
  if (role === 'admin' || role === 'instructor') return true
  const { data, error } = await db
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .in('status', ['activo', 'completado'])
    .limit(1)
  return !error && (data?.length ?? 0) > 0
}
