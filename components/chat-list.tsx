import { deleteChat, pinChat, updateChatTitle } from "@/lib/actions";
import { Chat } from "@/lib/db/db-types";
import { fetcher } from "@/lib/utils";
import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import { ChartBarStackedIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWRInfinite from "swr/infinite";
import { ChatItem } from "./chat-item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";
import { useDebounceCallback, useDebounceValue } from "usehooks-ts";

type GroupedChats = {
  pinned: Chat[];
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

export interface ChatHistory {
  chats: Array<Chat>;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export function getChatHistoryPaginationKey(
  pageIndex: number,
  previousPageData: any
) {
  if (previousPageData && previousPageData.hasMore === false) {
    return null;
  }

  if (pageIndex === 0) return `/api/history?limit=${PAGE_SIZE}`;

  const firstChatFromPage = previousPageData.chats.at(-1);

  if (!firstChatFromPage) return null;

  return `/api/history?ending_before=${firstChatFromPage.id}&limit=${PAGE_SIZE}`;
}

const groupChatsByDate = (chats: Chat[]): GroupedChats => {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return chats.reduce(
    (groups, chat) => {
      const chatDate = new Date(chat.createdAt);

      if (chat.isPinned) {
        groups.pinned.push(chat);
      } else if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }

      return groups;
    },
    {
      pinned: [],
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedChats
  );
};

export default function ChatList() {
  const { id } = useParams();
  const { setOpenMobile } = useSidebar();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<Chat[] | null>(null);

  const {
    data: paginatedChatHistories,
    isLoading,
    isValidating,
    mutate,
    setSize,
  } = useSWRInfinite(getChatHistoryPaginationKey, fetcher);

  const [debouncedSearchText] = useDebounceValue(searchText, 500);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const router = useRouter();

  const handleDelete = async () => {
    const deletePromise = deleteChat(deleteId!);

    toast.promise(deletePromise, {
      loading: "Deleting chat...",
      success: () => {
        mutate((chatHistories) => {
          if (chatHistories) {
            return chatHistories.map((chatHistory) => ({
              ...chatHistory,
              chats: chatHistory.chats.filter(
                (chat: any) => chat.id !== deleteId
              ),
            }));
          }
        });

        return "Chat deleted successfully";
      },
      error: "Failed to delete chat",
    });

    setShowDeleteDialog(false);

    if (deleteId === id) {
      router.push("/");
    }
  };

  const handlePin = async (chatId: string, isPinned: boolean) => {
    if (
      !isPinned &&
      paginatedChatHistories
        ?.flatMap((paginatedChatHistory) => paginatedChatHistory.chats)
        .filter((chat) => chat.isPinned).length === 5
    ) {
      toast.error("You cannot pin more than 5 chats");
      return;
    }
    const pinPromise = pinChat(chatId!, isPinned);

    toast.promise(pinPromise, {
      loading: "Pinning chat...",
      success: () => {
        mutate();
        return "Chat pinned successfully";
      },
      error: "Failed to pin chat",
    });

    setShowDeleteDialog(false);

    if (deleteId === id) {
      router.push("/");
    }
  };

  const setTitle = async (chatId: string, title: string) => {
    const updatePromise = updateChatTitle(chatId, title);
    toast.promise(updatePromise, {
      loading: "Updating chat title...",
      success: () => {
        mutate((chatHistories) => {
          if (chatHistories) {
            return chatHistories.map((chatHistory) => ({
              ...chatHistory,
              chats: chatHistory.chats.map((chat: any) => {
                if (chat.id === chatId) {
                  return {
                    ...chat,
                    title,
                  };
                }
                return chat;
              }),
            }));
          }
        });
        return "Chat title updated successfully";
      },
      error: "Failed to update chat title",
    });
  };

  useEffect(() => {
    if (!debouncedSearchText) {
      setSearchResults(null);
      return;
    }

    (async () => {
      const params = new URLSearchParams();
      params.set("query", debouncedSearchText);
      const results = await fetch(
        "/api/history/search?" + params.toString()
      ).then((res) => res.json());

      setSearchResults(results);
    })();
  }, [debouncedSearchText]);

  if (searchResults !== null) {
    const groupedChats = groupChatsByDate(searchResults);

    return (
      <>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarGroup>
                <SidebarMenuItem className="border-b flex gap-2 items-center pb-2">
                  <SearchIcon className="size-4 text-muted-foreground shrink-0" />
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full outline-none"
                    placeholder="Search your threads..."
                  />
                </SidebarMenuItem>
              </SidebarGroup>
              <div className="flex flex-col gap-6">
                {groupedChats.pinned.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                      Pinned
                    </div>
                    {groupedChats.pinned.map((chat) => (
                      <ChatItem
                        setTitle={setTitle}
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        onPin={(isPinned: boolean) =>
                          handlePin(chat.id, isPinned)
                        }
                        onDelete={(chatId) => {
                          setDeleteId(chatId);
                          setShowDeleteDialog(true);
                        }}
                        setOpenMobile={setOpenMobile}
                      />
                    ))}
                  </div>
                )}
                {groupedChats.today.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                      Today
                    </div>
                    {groupedChats.today.map((chat) => (
                      <ChatItem
                        setTitle={setTitle}
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        onPin={(isPinned: boolean) =>
                          handlePin(chat.id, isPinned)
                        }
                        onDelete={(chatId) => {
                          setDeleteId(chatId);
                          setShowDeleteDialog(true);
                        }}
                        setOpenMobile={setOpenMobile}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.yesterday.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                      Yesterday
                    </div>
                    {groupedChats.yesterday.map((chat) => (
                      <ChatItem
                        setTitle={setTitle}
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        onPin={(isPinned: boolean) =>
                          handlePin(chat.id, isPinned)
                        }
                        onDelete={(chatId) => {
                          setDeleteId(chatId);
                          setShowDeleteDialog(true);
                        }}
                        setOpenMobile={setOpenMobile}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.lastWeek.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                      Last 7 days
                    </div>
                    {groupedChats.lastWeek.map((chat) => (
                      <ChatItem
                        setTitle={setTitle}
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        onPin={(isPinned: boolean) =>
                          handlePin(chat.id, isPinned)
                        }
                        onDelete={(chatId) => {
                          setDeleteId(chatId);
                          setShowDeleteDialog(true);
                        }}
                        setOpenMobile={setOpenMobile}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.lastMonth.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                      Last 30 days
                    </div>
                    {groupedChats.lastMonth.map((chat) => (
                      <ChatItem
                        setTitle={setTitle}
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        onPin={(isPinned: boolean) =>
                          handlePin(chat.id, isPinned)
                        }
                        onDelete={(chatId) => {
                          setDeleteId(chatId);
                          setShowDeleteDialog(true);
                        }}
                        setOpenMobile={setOpenMobile}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.older.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                      Older than last month
                    </div>
                    {groupedChats.older.map((chat) => (
                      <ChatItem
                        setTitle={setTitle}
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === id}
                        onPin={(isPinned: boolean) =>
                          handlePin(chat.id, isPinned)
                        }
                        onDelete={(chatId) => {
                          setDeleteId(chatId);
                          setShowDeleteDialog(true);
                        }}
                        setOpenMobile={setOpenMobile}
                      />
                    ))}
                  </div>
                )}
              </div>
              {searchResults.length === 0 && (
                <div className="p-2 text-center text-muted-foreground">
                  No results found.
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete the chat?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will delete your chat and
                remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  const hasReachedEnd = paginatedChatHistories
    ? paginatedChatHistories.some((page) => page.hasMore === false)
    : false;

  const hasEmptyChatHistory = paginatedChatHistories
    ? paginatedChatHistories.every((page) => page.chats.length === 0)
    : false;

  if (isLoading) {
    return (
      <SidebarGroup>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
          Today
        </div>
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                key={item}
                className="rounded-md h-8 flex gap-2 px-2 items-center"
              >
                <Skeleton className="h-4" style={{ width: `${item}%` }} />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (hasEmptyChatHistory) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Your conversations will appear here once you start chatting!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarGroup>
              <SidebarMenuItem className="border-b flex gap-2 items-center pb-2">
                <SearchIcon className="size-4 text-muted-foreground shrink-0" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full outline-none"
                  placeholder="Search your threads..."
                />
              </SidebarMenuItem>
            </SidebarGroup>
            {paginatedChatHistories &&
              (() => {
                const chatsFromHistory = paginatedChatHistories.flatMap(
                  (paginatedChatHistory) => paginatedChatHistory.chats
                );

                const groupedChats = groupChatsByDate(chatsFromHistory);

                return (
                  <div className="flex flex-col gap-6">
                    {groupedChats.pinned.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                          Pinned
                        </div>
                        {groupedChats.pinned.map((chat) => (
                          <ChatItem
                            setTitle={setTitle}
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onPin={(isPinned: boolean) =>
                              handlePin(chat.id, isPinned)
                            }
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </div>
                    )}
                    {groupedChats.today.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                          Today
                        </div>
                        {groupedChats.today.map((chat) => (
                          <ChatItem
                            setTitle={setTitle}
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onPin={(isPinned: boolean) =>
                              handlePin(chat.id, isPinned)
                            }
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </div>
                    )}

                    {groupedChats.yesterday.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                          Yesterday
                        </div>
                        {groupedChats.yesterday.map((chat) => (
                          <ChatItem
                            setTitle={setTitle}
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onPin={(isPinned: boolean) =>
                              handlePin(chat.id, isPinned)
                            }
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </div>
                    )}

                    {groupedChats.lastWeek.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                          Last 7 days
                        </div>
                        {groupedChats.lastWeek.map((chat) => (
                          <ChatItem
                            setTitle={setTitle}
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onPin={(isPinned: boolean) =>
                              handlePin(chat.id, isPinned)
                            }
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </div>
                    )}

                    {groupedChats.lastMonth.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                          Last 30 days
                        </div>
                        {groupedChats.lastMonth.map((chat) => (
                          <ChatItem
                            setTitle={setTitle}
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onPin={(isPinned: boolean) =>
                              handlePin(chat.id, isPinned)
                            }
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </div>
                    )}

                    {groupedChats.older.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                          Older than last month
                        </div>
                        {groupedChats.older.map((chat) => (
                          <ChatItem
                            setTitle={setTitle}
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onPin={(isPinned: boolean) =>
                              handlePin(chat.id, isPinned)
                            }
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
          </SidebarMenu>

          <motion.div
            onViewportEnter={() => {
              if (!isValidating && !hasReachedEnd) {
                setSize((size) => size + 1);
              }
            }}
          />

          {hasReachedEnd ? (
            <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2 mt-8">
              You have reached the end of your chat history.
            </div>
          ) : (
            <div className="p-2 text-zinc-500 dark:text-zinc-400 flex flex-row gap-2 items-center mt-8">
              <Loader2Icon className="animate-spin" />
              <div>Loading Chats...</div>
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete the chat?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will delete your chat and
              remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
