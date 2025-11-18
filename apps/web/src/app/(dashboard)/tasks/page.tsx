"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@biolab/ui/components/card";
import { Button } from "@biolab/ui/components/button";
import { Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function TasksPage() {
  const { data: tasks, isLoading } = trpc.task.list.useQuery({});

  const todoTasks = tasks?.filter((t) => t.status === "TODO") || [];
  const inProgressTasks = tasks?.filter((t) => t.status === "IN_PROGRESS") || [];
  const doneTasks = tasks?.filter((t) => t.status === "DONE") || [];

  if (isLoading) {
    return <div>Caricamento task...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task</h1>
          <p className="text-gray-500">Gestisci le tue attività</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuovo Task
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <TaskColumn title="Da Fare" tasks={todoTasks} icon={Clock} color="blue" />
        <TaskColumn title="In Corso" tasks={inProgressTasks} icon={AlertCircle} color="yellow" />
        <TaskColumn title="Completati" tasks={doneTasks} icon={CheckCircle2} color="green" />
      </div>
    </div>
  );
}

function TaskColumn({
  title,
  tasks,
  icon: Icon,
  color,
}: {
  title: string;
  tasks: Array<{
    id: string;
    title: string;
    description?: string | null;
    priority?: string;
    assignedTo?: { name?: string | null } | null;
  }>;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 text-${color}-500`} />
          {title} ({tasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          >
            <p className="font-medium text-sm">{task.title}</p>
            {task.description && (
              <p className="text-xs text-gray-500 mt-1">{task.description}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  task.priority === "HIGH" || task.priority === "URGENT"
                    ? "bg-red-100 text-red-800"
                    : task.priority === "MEDIUM"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {task.priority}
              </span>
              {task.assignedTo && (
                <span className="text-xs text-gray-500">{task.assignedTo.name}</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
