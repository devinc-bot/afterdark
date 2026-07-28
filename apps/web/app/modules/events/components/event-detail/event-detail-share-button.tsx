import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Share2 } from 'lucide-react'
import { Button, toast } from '@repo/ui'

type EventDetailShareButtonProps = {
  eventName: string
}

async function shareOrCopyLink(url: string, title: string): Promise<'shared' | 'copied'> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, url })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error
      }
    }
  }

  await navigator.clipboard.writeText(url)
  return 'copied'
}

export function EventDetailShareButton({ eventName }: EventDetailShareButtonProps) {
  const { t } = useTranslation('events')
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    setIsSharing(true)

    try {
      const result = await shareOrCopyLink(url, eventName)
      toast.success(
        result === 'shared' ? t('discover.detail.shareShared') : t('discover.detail.shareCopied')
      )
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      toast.error(t('discover.detail.shareError'))
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-10 gap-2 rounded-lg"
      onClick={() => {
        void handleShare()
      }}
      disabled={isSharing}
    >
      <Share2 className="size-4" aria-hidden />
      {t('discover.detail.share')}
    </Button>
  )
}
