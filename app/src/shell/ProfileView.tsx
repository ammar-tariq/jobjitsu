import { useEffect, useRef, useState, type JSX } from "react";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import type { IpcBridge } from "../ipc/bridge.js";
import type { PathSnapshot, ProfileSnapshot, ResumeVersionSnapshot } from "../ipc/commands.js";

export type ProfileViewProps = {
  readonly bridge: IpcBridge;
};

type DraftProfile = {
  readonly displayName: string;
  readonly email: string;
  readonly location: string;
};

const emptyDraft = (): DraftProfile => ({
  displayName: "",
  email: "",
  location: "",
});

/**
 * Profile tree: multiple local identities → Paths under each → resumes under each Path.
 */
export function ProfileView({ bridge }: ProfileViewProps): JSX.Element {
  const [profiles, setProfiles] = useState<readonly ProfileSnapshot[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [openProfileId, setOpenProfileId] = useState<string | null>(null);
  const [draftByProfileId, setDraftByProfileId] = useState<Record<string, DraftProfile>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<DraftProfile>(emptyDraft);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectingProfileId, setSelectingProfileId] = useState<string | null>(null);

  const [paths, setPaths] = useState<readonly PathSnapshot[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [pathName, setPathName] = useState("");
  const [pathNotes, setPathNotes] = useState("");
  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [pathStatus, setPathStatus] = useState<string | null>(null);
  const [savingPath, setSavingPath] = useState(false);
  const [selectingPathId, setSelectingPathId] = useState<string | null>(null);
  const [pathsOpenByProfile, setPathsOpenByProfile] = useState<Record<string, boolean>>({});
  const [openPathId, setOpenPathId] = useState<string | null>(null);
  const [addPathForProfileId, setAddPathForProfileId] = useState<string | null>(null);

  const [versions, setVersions] = useState<readonly ResumeVersionSnapshot[]>([]);
  const [resumeLabel, setResumeLabel] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectingResumeId, setSelectingResumeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshProfiles = async (): Promise<void> => {
    const result = await bridge.listProfiles();
    if (!result.ok) {
      return;
    }
    setProfiles(result.value.profiles);
    setSelectedProfileId(result.value.selectedId);
    setDraftByProfileId((prev) => {
      const next = { ...prev };
      for (const profile of result.value.profiles) {
        next[profile.id] = {
          displayName: profile.displayName,
          email: profile.email ?? "",
          location: profile.location ?? "",
        };
      }
      return next;
    });
  };

  const refreshPaths = async (): Promise<void> => {
    const result = await bridge.listPaths();
    if (result.ok) {
      setPaths(result.value.paths);
      setSelectedPathId(result.value.selectedId);
    }
  };

  const refreshVersions = async (): Promise<void> => {
    const result = await bridge.listResumeVersions();
    if (result.ok) {
      setVersions(result.value.versions);
    }
  };

  useEffect(() => {
    let cancelled = false;
    void bridge.listProfiles().then((result) => {
      if (cancelled || !result.ok) {
        return;
      }
      setProfiles(result.value.profiles);
      setSelectedProfileId(result.value.selectedId);
      const drafts: Record<string, DraftProfile> = {};
      for (const profile of result.value.profiles) {
        drafts[profile.id] = {
          displayName: profile.displayName,
          email: profile.email ?? "",
          location: profile.location ?? "",
        };
      }
      setDraftByProfileId(drafts);
      if (result.value.profiles.length === 0) {
        setCreateOpen(true);
      } else if (result.value.selectedId) {
        setOpenProfileId(result.value.selectedId);
        setPathsOpenByProfile({ [result.value.selectedId]: true });
      }
    });
    void bridge.listPaths().then((result) => {
      if (!cancelled && result.ok) {
        setPaths(result.value.paths);
        setSelectedPathId(result.value.selectedId);
      }
    });
    void bridge.listResumeVersions().then((result) => {
      if (!cancelled && result.ok) {
        setVersions(result.value.versions);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [bridge]);

  const onSaveProfile = (profileId: string): void => {
    const draft = draftByProfileId[profileId];
    if (!draft || draft.displayName.trim().length === 0) {
      return;
    }
    setSaving(true);
    setStatus(null);
    void bridge
      .setProfile({
        id: profileId,
        displayName: draft.displayName,
        email: draft.email || undefined,
        location: draft.location || undefined,
      })
      .then(async (result) => {
        setSaving(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        setStatus("Stored on this device.");
        await refreshProfiles();
      });
  };

  const onCreateProfile = (): void => {
    if (createDraft.displayName.trim().length === 0) {
      return;
    }
    setSaving(true);
    setStatus(null);
    void bridge
      .setProfile({
        displayName: createDraft.displayName,
        email: createDraft.email || undefined,
        location: createDraft.location || undefined,
        createNew: true,
      })
      .then(async (result) => {
        setSaving(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        setStatus("Profile created. Stored on this device.");
        setCreateDraft(emptyDraft());
        setCreateOpen(false);
        setOpenProfileId(result.value.profile.id);
        setPathsOpenByProfile((prev) => ({ ...prev, [result.value.profile.id]: true }));
        setAddPathForProfileId(result.value.profile.id);
        await refreshProfiles();
      });
  };

  const onImportResume = (pathId: string): void => {
    if (!resumeFile) {
      setImportStatus("Choose a resume file to import.");
      return;
    }
    const file = resumeFile;
    setImporting(true);
    setImportStatus(null);
    void readFileBytes(file)
      .then((bytes) =>
        bridge.importResume({
          label: resumeLabel || file.name,
          fileName: file.name,
          contentBase64: bytesToBase64(bytes),
          contentType: file.type || undefined,
          pathId,
        }),
      )
      .then(async (result) => {
        setImporting(false);
        if (!result.ok) {
          setImportStatus(result.error.message ?? result.error.title);
          return;
        }
        setImportStatus("Resume imported for this path. Stored on this device.");
        setResumeLabel("");
        setResumeFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        await refreshVersions();
        await refreshPaths();
      })
      .catch(() => {
        setImporting(false);
        setImportStatus("Something went wrong importing that file. Try again.");
      });
  };

  const renderPathTree = (profileId: string): JSX.Element => {
    const profilePaths = paths.filter((path) => path.profileId === profileId);
    const pathsOpen = pathsOpenByProfile[profileId] !== false;
    const showAddForm = addPathForProfileId === profileId || editingPathId !== null;

    return (
      <List dense disablePadding>
        <TreeRow
          depth={1}
          open={pathsOpen}
          onToggle={() =>
            setPathsOpenByProfile((prev) => ({
              ...prev,
              [profileId]: !pathsOpen,
            }))
          }
          icon={<WorkOutlineRoundedIcon fontSize="small" />}
          primary="Paths"
          secondary={
            profilePaths.length === 0
              ? "No career paths yet"
              : `${profilePaths.length} path${profilePaths.length === 1 ? "" : "s"}`
          }
          testId={`jj-tree-paths-${profileId}`}
        />
        <Collapse in={pathsOpen} timeout="auto" unmountOnExit>
          <List
            dense
            disablePadding
            data-testid={profileId === selectedProfileId ? "jj-path-library" : undefined}
            sx={{ bgcolor: "action.hover" }}
          >
            {profilePaths.map((path) => {
              const isSelected = path.id === selectedPathId;
              const isOpen = path.id === openPathId;
              const pathVersions = versions.filter((version) => version.pathId === path.id);
              return (
                <Stack key={path.id} data-testid={`jj-path-card-${path.id}`}>
                  <TreeRow
                    depth={2}
                    open={isOpen}
                    onToggle={() => {
                      setOpenPathId(isOpen ? null : path.id);
                      setImportStatus(null);
                    }}
                    icon={<WorkOutlineRoundedIcon fontSize="small" />}
                    primary={`${path.name}${isSelected ? " · Active" : ""}`}
                    secondary={path.notes}
                    testId={`jj-tree-path-${path.id}`}
                    actions={
                      <>
                        <Button
                          size="small"
                          variant={isSelected ? "contained" : "text"}
                          disabled={selectingPathId === path.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectingPathId(path.id);
                            setPathStatus(null);
                            void bridge.selectPath(path.id).then(async (result) => {
                              setSelectingPathId(null);
                              if (!result.ok) {
                                setPathStatus(result.error.message ?? result.error.title);
                                return;
                              }
                              setPathStatus("Path selected. Nothing was sent.");
                              await refreshPaths();
                            });
                          }}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditingPathId(path.id);
                            setPathName(path.name);
                            setPathNotes(path.notes ?? "");
                            setPathStatus(null);
                            setAddPathForProfileId(profileId);
                            setPathsOpenByProfile((prev) => ({ ...prev, [profileId]: true }));
                          }}
                        >
                          Rename
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          color="inherit"
                          onClick={(event) => {
                            event.stopPropagation();
                            setPathStatus(null);
                            void bridge.archivePath(path.id).then(async (result) => {
                              if (!result.ok) {
                                setPathStatus(result.error.message ?? result.error.title);
                                return;
                              }
                              if (editingPathId === path.id) {
                                setEditingPathId(null);
                                setPathName("");
                                setPathNotes("");
                              }
                              if (openPathId === path.id) {
                                setOpenPathId(null);
                              }
                              setPathStatus("Path archived. Stored on this device.");
                              await refreshPaths();
                            });
                          }}
                        >
                          Archive
                        </Button>
                      </>
                    }
                  />
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <Stack
                      spacing={1.5}
                      data-testid={`jj-path-resumes-${path.id}`}
                      sx={{ px: 2, py: 1.5, pl: 9 }}
                    >
                      <Typography color="text.secondary" variant="body2">
                        Resumes for this Path. Selection stays on this device and does not send
                        anything.
                      </Typography>
                      {pathVersions.map((version) => {
                        const isResumeSelected = version.id === path.selectedResumeVersionId;
                        return (
                          <ListItemButton
                            key={version.id}
                            dense
                            selected={isResumeSelected}
                            sx={{ borderRadius: 1, gap: 1 }}
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <DescriptionOutlinedIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={version.label} secondary={version.fileName} />
                            <Button
                              size="small"
                              variant={isResumeSelected ? "contained" : "outlined"}
                              disabled={selectingResumeId === version.id}
                              onClick={() => {
                                setSelectingResumeId(version.id);
                                setImportStatus(null);
                                void bridge.selectResume(version.id).then(async (selected) => {
                                  if (!selected.ok) {
                                    setSelectingResumeId(null);
                                    setImportStatus(selected.error.message ?? selected.error.title);
                                    return;
                                  }
                                  const linked = await bridge.upsertPath({
                                    id: path.id,
                                    name: path.name,
                                    notes: path.notes,
                                    profileId: path.profileId,
                                    selectedResumeVersionId: version.id,
                                  });
                                  setSelectingResumeId(null);
                                  if (!linked.ok) {
                                    setImportStatus(linked.error.message ?? linked.error.title);
                                    return;
                                  }
                                  setImportStatus(
                                    "Resume selected for this path. Nothing was sent.",
                                  );
                                  await refreshVersions();
                                  await refreshPaths();
                                });
                              }}
                            >
                              {isResumeSelected ? "Selected" : "Select"}
                            </Button>
                          </ListItemButton>
                        );
                      })}
                      {pathVersions.length === 0 ? (
                        <Typography color="text.secondary" variant="body2">
                          No resumes for this Path yet.
                        </Typography>
                      ) : null}
                      <TextField
                        label="Version label"
                        value={resumeLabel}
                        onChange={(event) => setResumeLabel(event.target.value)}
                        size="small"
                        fullWidth
                        placeholder="e.g. Baseline 2026"
                      />
                      <Button variant="outlined" component="label">
                        {resumeFile ? resumeFile.name : "Choose file"}
                        <input
                          ref={fileInputRef}
                          hidden
                          type="file"
                          data-testid={`jj-path-resume-file-${path.id}`}
                          onChange={(event) => {
                            const next = event.target.files?.[0] ?? null;
                            setResumeFile(next);
                            if (next && !resumeLabel.trim()) {
                              setResumeLabel(next.name.replace(/\.[^.]+$/, ""));
                            }
                          }}
                        />
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => onImportResume(path.id)}
                        disabled={importing || !resumeFile}
                      >
                        Import resume
                      </Button>
                      {importStatus && openPathId === path.id ? (
                        <Typography role="status" color="text.secondary" variant="body2">
                          {importStatus}
                        </Typography>
                      ) : null}
                    </Stack>
                  </Collapse>
                </Stack>
              );
            })}

            <Stack spacing={1.5} sx={{ px: 2, py: 1.5, pl: 7 }}>
              {!showAddForm ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setAddPathForProfileId(profileId);
                    setEditingPathId(null);
                    setPathName("");
                    setPathNotes("");
                    setPathStatus(null);
                  }}
                >
                  Add path
                </Button>
              ) : (
                <>
                  <Typography color="text.secondary" variant="body2">
                    {profilePaths.length === 0
                      ? "Add a Path under this profile (for example Fullstack Developer)."
                      : "Add another Path under this profile."}
                  </Typography>
                  <TextField
                    label="Path name"
                    value={pathName}
                    onChange={(event) => setPathName(event.target.value)}
                    size="small"
                    fullWidth
                    placeholder="e.g. Fullstack Developer"
                    slotProps={{ htmlInput: { "data-testid": "jj-path-name-input" } }}
                  />
                  <TextField
                    label="Notes (optional)"
                    value={pathNotes}
                    onChange={(event) => setPathNotes(event.target.value)}
                    size="small"
                    fullWidth
                    placeholder="e.g. React Native focus"
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      disabled={savingPath || pathName.trim().length === 0}
                      onClick={() => {
                        setSavingPath(true);
                        setPathStatus(null);
                        void bridge
                          .upsertPath({
                            id: editingPathId ?? undefined,
                            name: pathName,
                            notes: pathNotes || undefined,
                            profileId,
                          })
                          .then(async (result) => {
                            setSavingPath(false);
                            if (!result.ok) {
                              setPathStatus(result.error.message ?? result.error.title);
                              return;
                            }
                            setPathStatus(
                              editingPathId
                                ? "Path updated. Stored on this device."
                                : "Path saved. Stored on this device.",
                            );
                            setPathName("");
                            setPathNotes("");
                            setEditingPathId(null);
                            setAddPathForProfileId(profileId);
                            setOpenPathId(result.value.path.id);
                            await refreshPaths();
                          });
                      }}
                    >
                      {editingPathId ? "Update path" : "Add path"}
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => {
                        setEditingPathId(null);
                        setPathName("");
                        setPathNotes("");
                        setAddPathForProfileId(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </>
              )}
              {pathStatus && addPathForProfileId === profileId ? (
                <Typography role="status" color="text.secondary" variant="body2">
                  {pathStatus}
                </Typography>
              ) : null}
            </Stack>
          </List>
        </Collapse>
      </List>
    );
  };

  return (
    <Stack spacing={3} data-testid="jj-profile" sx={{ maxWidth: "44rem" }}>
      <Stack spacing={1}>
        <Typography component="h2" variant="h2">
          Profile
        </Typography>
        <Typography color="text.secondary">
          Create one or more profiles on this device. Paths and resumes nest under each profile.
          Switching profiles does not send anything.
        </Typography>
      </Stack>

      <List
        dense
        disablePadding
        data-testid="jj-profile-tree"
        aria-label="Profile tree"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        {profiles.map((profile) => {
          const isOpen = openProfileId === profile.id;
          const isSelected = selectedProfileId === profile.id;
          const draft = draftByProfileId[profile.id] ?? {
            displayName: profile.displayName,
            email: profile.email ?? "",
            location: profile.location ?? "",
          };
          return (
            <Stack key={profile.id}>
              <TreeRow
                depth={0}
                open={isOpen}
                onToggle={() => setOpenProfileId(isOpen ? null : profile.id)}
                icon={<PersonOutlineRoundedIcon fontSize="small" />}
                primary={`${profile.displayName}${isSelected ? " · Active" : ""}`}
                secondary="Profile"
                testId={`jj-tree-profile-${profile.id}`}
                actions={
                  <Button
                    size="small"
                    variant={isSelected ? "contained" : "text"}
                    disabled={selectingProfileId === profile.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectingProfileId(profile.id);
                      setStatus(null);
                      void bridge.selectProfile(profile.id).then(async (result) => {
                        setSelectingProfileId(null);
                        if (!result.ok) {
                          setStatus(result.error.message ?? result.error.title);
                          return;
                        }
                        setStatus("Profile selected. Nothing was sent.");
                        setOpenProfileId(profile.id);
                        await refreshProfiles();
                      });
                    }}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </Button>
                }
              />
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Stack
                  spacing={1.5}
                  component="form"
                  data-testid={isSelected ? "jj-profile-form" : `jj-profile-form-${profile.id}`}
                  onSubmit={(e) => e.preventDefault()}
                  sx={{ px: 2, py: 1.5, pl: 5, bgcolor: "action.hover" }}
                >
                  <TextField
                    label="Display name"
                    value={draft.displayName}
                    onChange={(event) =>
                      setDraftByProfileId((prev) => ({
                        ...prev,
                        [profile.id]: { ...draft, displayName: event.target.value },
                      }))
                    }
                    size="small"
                    required
                    fullWidth
                    autoComplete="name"
                  />
                  <TextField
                    label="Email"
                    value={draft.email}
                    onChange={(event) =>
                      setDraftByProfileId((prev) => ({
                        ...prev,
                        [profile.id]: { ...draft, email: event.target.value },
                      }))
                    }
                    size="small"
                    fullWidth
                    autoComplete="email"
                  />
                  <TextField
                    label="Location"
                    value={draft.location}
                    onChange={(event) =>
                      setDraftByProfileId((prev) => ({
                        ...prev,
                        [profile.id]: { ...draft, location: event.target.value },
                      }))
                    }
                    size="small"
                    fullWidth
                    autoComplete="address-level2"
                  />
                  <Button
                    variant="contained"
                    onClick={() => onSaveProfile(profile.id)}
                    disabled={saving || draft.displayName.trim().length === 0}
                  >
                    Save profile
                  </Button>
                </Stack>
                {renderPathTree(profile.id)}
              </Collapse>
            </Stack>
          );
        })}

        <TreeRow
          depth={0}
          open={createOpen}
          onToggle={() => setCreateOpen((value) => !value)}
          icon={<PersonOutlineRoundedIcon fontSize="small" />}
          primary="Create profile"
          secondary="New identity on this device"
          testId="jj-tree-create-profile"
        />
        <Collapse in={createOpen} timeout="auto" unmountOnExit>
          <Stack
            spacing={1.5}
            component="form"
            data-testid="jj-profile-create-form"
            onSubmit={(e) => e.preventDefault()}
            sx={{ px: 2, py: 1.5, pl: 5, bgcolor: "action.hover" }}
          >
            <TextField
              label="Display name"
              value={createDraft.displayName}
              onChange={(event) =>
                setCreateDraft((prev) => ({ ...prev, displayName: event.target.value }))
              }
              size="small"
              required
              fullWidth
              autoComplete="name"
            />
            <TextField
              label="Email"
              value={createDraft.email}
              onChange={(event) =>
                setCreateDraft((prev) => ({ ...prev, email: event.target.value }))
              }
              size="small"
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="Location"
              value={createDraft.location}
              onChange={(event) =>
                setCreateDraft((prev) => ({ ...prev, location: event.target.value }))
              }
              size="small"
              fullWidth
              autoComplete="address-level2"
            />
            <Button
              variant="contained"
              onClick={onCreateProfile}
              disabled={saving || createDraft.displayName.trim().length === 0}
            >
              Create profile
            </Button>
          </Stack>
        </Collapse>
      </List>

      {status ? (
        <Typography role="status" color="text.secondary" variant="body2">
          {status}
        </Typography>
      ) : null}
    </Stack>
  );
}

type TreeRowProps = {
  readonly depth: number;
  readonly open: boolean;
  readonly onToggle: () => void;
  readonly icon: JSX.Element;
  readonly primary: string;
  readonly secondary?: string;
  readonly testId: string;
  readonly actions?: JSX.Element;
};

function TreeRow({
  depth,
  open,
  onToggle,
  icon,
  primary,
  secondary,
  testId,
  actions,
}: TreeRowProps): JSX.Element {
  return (
    <ListItemButton
      data-testid={testId}
      onClick={onToggle}
      sx={{
        py: 1,
        pl: 1 + depth * 2,
        pr: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
        gap: 0.5,
      }}
    >
      <IconButton
        size="small"
        edge="start"
        aria-label={open ? "Collapse" : "Expand"}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        sx={{ color: "text.secondary" }}
      >
        {open ? (
          <ExpandMoreRoundedIcon fontSize="small" />
        ) : (
          <ChevronRightRoundedIcon fontSize="small" />
        )}
      </IconButton>
      <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>{icon}</ListItemIcon>
      <ListItemText
        primary={primary}
        secondary={secondary}
        slotProps={{
          primary: { variant: "body1" },
          secondary: { variant: "body2" },
        }}
      />
      {actions ? (
        <Stack
          direction="row"
          spacing={0.5}
          onClick={(event) => event.stopPropagation()}
          sx={{ flexShrink: 0 }}
        >
          {actions}
        </Stack>
      ) : null}
    </ListItemButton>
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

async function readFileBytes(file: File): Promise<Uint8Array> {
  if (typeof file.arrayBuffer === "function") {
    return new Uint8Array(await file.arrayBuffer());
  }
  if (typeof file.text === "function") {
    return new TextEncoder().encode(await file.text());
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(new TextEncoder().encode(reader.result));
        return;
      }
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
        return;
      }
      reject(new Error("Could not read that file."));
    };
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsArrayBuffer(file);
  });
}
