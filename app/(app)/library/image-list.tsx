"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { deleteImages } from "@/lib/actions";
import { Attachment } from "@/lib/db/db-types"
import { formatBytes } from "@/lib/utils";
import { formatDate } from "date-fns"
import {
  DownloadIcon,
  LoaderIcon,
  MessageCircleIcon,
  TrashIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react"

export default function ImageList({
  attachments,
}: {
  attachments: Attachment[]
}) {
  const [selecting, setSelecting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSelecting((prev) => !prev)}
      >
        {selecting ? "Done selecting" : "Select images"}
      </Button>
      {selecting && (
        <div className="sticky top-2 z-20 bg-background p-2 text-sm text-muted-foreground rounded-xl flex gap-2 items-center">
          <div className="text-xs text-muted-foreground ml-2">
            {selectedImages.length} selected
          </div>
          <Button
            disabled={selectedImages.length === 0 || loading}
            variant="destructive"
            size="icon"
            onClick={async () => {
              setLoading(true)
              await deleteImages(selectedImages)
              setSelectedImages([])
              setSelecting(false)
              setLoading(false)
              router.refresh()
            }}
          >
            {loading ? <LoaderIcon className="animate-spin" /> : <TrashIcon />}
          </Button>
        </div>
      )}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="group rounded-xl overflow-hidden relative"
          >
            <img
              src={attachment.url}
              alt="image in chat"
              className="w-full group-hover:scale-110 transition-all"
            />
            {selecting && (
              <Checkbox
                checked={selectedImages.includes(attachment.id)}
                onCheckedChange={() =>
                  setSelectedImages((prev) => {
                    if (prev.includes(attachment.id)) {
                      return prev.filter((id) => id !== attachment.id)
                    }
                    return [...prev, attachment.id]
                  })
                }
                className="absolute top-2 left-2 z-10 bg-input! data-[state=checked]:bg-primary!"
              />
            )}
            <div className="absolute bottom-0 w-full h-fit bg-black/50 flex items-center opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1">
              <div className="flex flex-col mr-auto ml-2 text-xs text-muted-foreground/80">
                <div>
                  {formatDate(new Date(attachment.createdAt), "dd.MM.yyyy")}
                </div>
                <div>{formatBytes(attachment.size)}</div>
              </div>

              <Button size="icon" variant="ghost" asChild>
                <Link
                  href={`/chat/${attachment.chatId}#${attachment.messageId}`}
                >
                  <MessageCircleIcon />
                </Link>
              </Button>
              <Button size="icon" variant="ghost" asChild>
                <Link
                  href={attachment.url}
                  target="_blank"
                  download="image.png"
                >
                  <DownloadIcon />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
