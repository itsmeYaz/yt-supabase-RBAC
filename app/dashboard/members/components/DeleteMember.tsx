import { Button } from '@/components/ui/button'
import { TrashIcon } from '@radix-ui/react-icons'

function DeleteMember() {
  return (
    <div>
      <Button variant='outline'>
        <TrashIcon />
        Delete
      </Button>
    </div>
  )
}

export default DeleteMember
