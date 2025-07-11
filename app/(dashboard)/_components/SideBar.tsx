import { Logo } from "./Logo"
import { SidebarRoutes } from "./SidebarRoutes"

export const SideBar = () => {
  return (
    <div className="h-full border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto bg-white dark:bg-gray-900 shadow-sm">
      <div className="p-6">
        <Logo />
      </div>
      <div className="flex flex-col w-full">
        <SidebarRoutes />
      </div>
    </div>
  )
}
