import { Message } from "@/lib/db/db-types"
import React, { useState } from "react"
import { AutosizeTextarea } from "./ui/autosize-textarea"
import { Button } from "./ui/button"

export default function EditingMessage({
  message,
  setEditingMessage,
  editMessage,
}: {
  message: Message
  setEditingMessage: (editing: boolean) => void
  editMessage: (text: string) => void
}) {
  const [currentMessage, setCurrentMessage] = useState(
    message.parts[0].type === "text" ? message.parts[0].text : ""
  )

  const save = () => {
    editMessage(currentMessage)
    setEditingMessage(false)
  }

  return (
    <div className="border rounded-xl w-full">
      <AutosizeTextarea
        className="resize-none p-4 outline-none w-full"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        maxHeight={280}
        autoFocus
      />
      <div className="border-t flex gap-2 items-center justify-end p-4">
        <Button variant="outline" onClick={() => setEditingMessage(false)}>
          Cancel
        </Button>
        <Button onClick={save}>Save</Button>
      </div>
    </div>
  )
}
