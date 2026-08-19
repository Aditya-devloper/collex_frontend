"use client";

import { Checkbox } from "@/components/ui/checkbox";

export type ModulePermissions = {
  view?: boolean;
  add?: boolean;
  edit?: boolean;
  delete?: boolean;
};

export type AgentPermissions = {
  leads: ModulePermissions;
  calls: ModulePermissions;
  chat: ModulePermissions;
  // billing: ModulePermissions;
};

export const DEFAULT_PERMISSIONS: AgentPermissions = {
  leads: { view: true, add: false, edit: false, delete: false },
  calls: { view: false, add: false, edit: false, delete: false },
  chat: { view: true, add: false, edit: false, delete: false },
  // billing: { view: false },
};

const MODULE_ACTIONS: Record<
  keyof AgentPermissions,
  (keyof ModulePermissions)[]
> = {
  leads: ["view", "add", "edit", "delete"],
  calls: ["view", "add", "edit", "delete"],
  chat: ["view", "add", "edit", "delete"],
  // billing: ["view"],
};

const MODULE_LABELS: Record<keyof AgentPermissions, string> = {
  leads: "Leads",
  calls: "Calls",
  chat: "Chat",
  // billing: "Billing",
};

const ACTION_LABELS: Record<keyof ModulePermissions, string> = {
  view: "View",
  add: "Add",
  edit: "Edit",
  delete: "Delete",
};

export function PermissionMatrix({
  value,
  onChange,
  readOnly = false,
}: {
  value: AgentPermissions;
  onChange?: (next: AgentPermissions) => void;
  readOnly?: boolean;
}) {
  const toggle = (
    mod: keyof AgentPermissions,
    action: keyof ModulePermissions,
    checked: boolean,
  ) => {
    if (readOnly || !onChange) return;
    onChange({
      ...value,
      [mod]: { ...value[mod], [action]: checked },
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-2 text-left font-medium">Module</th>
            {(["view", "add", "edit", "delete"] as const).map((action) => (
              <th key={action} className="px-4 py-2 text-center font-medium">
                {ACTION_LABELS[action]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(Object.keys(MODULE_ACTIONS) as (keyof AgentPermissions)[]).map(
            (mod) => (
              <tr key={mod} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium">{MODULE_LABELS[mod]}</td>
                {(["view", "add", "edit", "delete"] as const).map((action) => {
                  const applicable = MODULE_ACTIONS[mod].includes(action);
                  return (
                    <td key={action} className="px-4 py-3 text-center">
                      {applicable ? (
                        <Checkbox
                          checked={!!value[mod]?.[action]}
                          disabled={readOnly}
                          onCheckedChange={(checked) =>
                            toggle(mod, action, !!checked)
                          }
                          className="cursor-pointer"
                        />
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
