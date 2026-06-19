import { useMutation } from '@tanstack/react-query'
import type { CreateClubInput } from '@afterdark/validators'
import { createClub } from '~/modules/club-management/service/club-management.service'

export function useCreateClub() {
  return useMutation({
    mutationFn: (input: CreateClubInput) => createClub(input),
  })
}
