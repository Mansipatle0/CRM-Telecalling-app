"use client"
 import { RoleGuard } from "@/components/role-guard" 
 import { TeamOverview } from "@/components/manager/team-overview"
  export default function ManagerTeamPage() { 
    return ( 
      <RoleGuard allowedRoles={["manager"]}> 
      <div className="p-6 space-y-6"> 
        <div> 
          <h1 className="text-3xl font-bold">Team Management</h1> 
          <p className="text-muted-foreground mt-2">Monitor and manage your team members</p> 
          </div> 
          <TeamOverview />
           </div>
            </RoleGuard>
             ) 
            }