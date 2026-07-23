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

/**
 * Profile tree: create/edit Profile → Paths under it → resumes under each Path.
 */
export function ProfileView({ bridge }: ProfileViewProps): JSX.Element {
  const [profile, setProfile] = useState<ProfileSnapshot | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [paths, setPaths] = useState<readonly PathSnapshot[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [pathName, setPathName] = useState("");
  const [pathNotes, setPathNotes] = useState("");
  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [pathStatus, setPathStatus] = useState<string | null>(null);
  const [savingPath, setSavingPath] = useState(false);
  const [selectingPathId, setSelectingPathId] = useState<string | null>(null);

  const [profileOpen, setProfileOpen] = useState(true);
  const [pathsOpen, setPathsOpen] = useState(true);
  const [openPathId, setOpenPathId] = useState<string | null>(null);

  const [versions, setVersions] = useState<readonly ResumeVersionSnapshot[]>([]);
  const [resumeLabel, setResumeLabel] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectingResumeId, setSelectingResumeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasProfile = profile !== null;

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
    void bridge.getProfile().then((result) => {
      if (cancelled || !result.ok) {
        return;
      }
      const next = result.value.profile;
      setProfile(next);
      setDisplayName(next?.displayName ?? "");
      setEmail(next?.email ?? "");
      setLocation(next?.location ?? "");
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

  const onSaveProfile = (): void => {
    setSaving(true);
    setStatus(null);
    void bridge
      .setProfile({
        displayName,
        email: email || undefined,
        location: location || undefined,
      })
      .then((result) => {
        setSaving(false);
        if (!result.ok) {
          setStatus(result.error.message ?? result.error.title);
          return;
        }
        const wasCreate = profile === null;
        setProfile(result.value.profile);
        setStatus(wasCreate ? "Profile created. Stored on this device." : "Stored on this device.");
        setProfileOpen(true);
        setPathsOpen(true);
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

  const profileLabel = hasProfile
    ? displayName.trim() || profile.displayName || "Your profile"
    : "Create profile";

  return (
    <Stack spacing={3} data-testid="jj-profile" sx={{ maxWidth: "44rem" }}>
      <Stack spacing={1}>
        <Typography component="h2" variant="h2">
          Profile
        </Typography>
        <Typography color="text.secondary">
          Create a profile, add Paths under it, then attach resumes to each Path. Everything stays
          on this device.
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
        <TreeRow
          depth={0}
          open={profileOpen}
          onToggle={() => setProfileOpen((value) => !value)}
          icon={<PersonOutlineRoundedIcon fontSize="small" />}
          primary={profileLabel}
          secondary={hasProfile ? "Profile" : "Start here"}
          testId="jj-tree-profile"
        />
        <Collapse in={profileOpen} timeout="auto" unmountOnExit>
          <Stack
            spacing={1.5}
            component="form"
            data-testid="jj-profile-form"
            onSubmit={(e) => e.preventDefault()}
            sx={{ px: 2, py: 1.5, pl: 5, bgcolor: "action.hover" }}
          >
            <TextField
              label="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              size="small"
              required
              fullWidth
              autoComplete="name"
            />
            <TextField
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              size="small"
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="Location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              size="small"
              fullWidth
              autoComplete="address-level2"
            />
            <Button
              variant="contained"
              onClick={onSaveProfile}
              disabled={saving || displayName.trim().length === 0}
            >
              {hasProfile ? "Save profile" : "Create profile"}
            </Button>
            {status ? (
              <Typography role="status" color="text.secondary" variant="body2">
                {status}
              </Typography>
            ) : null}
          </Stack>

          {hasProfile ? (
            <List dense disablePadding>
              <TreeRow
                depth={1}
                open={pathsOpen}
                onToggle={() => setPathsOpen((value) => !value)}
                icon={<WorkOutlineRoundedIcon fontSize="small" />}
                primary="Paths"
                secondary={
                  paths.length === 0
                    ? "No career paths yet"
                    : `${paths.length} path${paths.length === 1 ? "" : "s"}`
                }
                testId="jj-tree-paths"
              />
              <Collapse in={pathsOpen} timeout="auto" unmountOnExit>
                <List
                  dense
                  disablePadding
                  data-testid="jj-path-library"
                  sx={{ bgcolor: "action.hover" }}
                >
                  {paths.map((path) => {
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
                                  setPathsOpen(true);
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
                              Resumes for this Path. Selection stays on this device and does not
                              send anything.
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
                                  <ListItemText
                                    primary={version.label}
                                    secondary={version.fileName}
                                  />
                                  <Button
                                    size="small"
                                    variant={isResumeSelected ? "contained" : "outlined"}
                                    disabled={selectingResumeId === version.id}
                                    onClick={() => {
                                      setSelectingResumeId(version.id);
                                      setImportStatus(null);
                                      void bridge
                                        .selectResume(version.id)
                                        .then(async (selected) => {
                                          if (!selected.ok) {
                                            setSelectingResumeId(null);
                                            setImportStatus(
                                              selected.error.message ?? selected.error.title,
                                            );
                                            return;
                                          }
                                          const linked = await bridge.upsertPath({
                                            id: path.id,
                                            name: path.name,
                                            notes: path.notes,
                                            selectedResumeVersionId: version.id,
                                          });
                                          setSelectingResumeId(null);
                                          if (!linked.ok) {
                                            setImportStatus(
                                              linked.error.message ?? linked.error.title,
                                            );
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
                    <Typography color="text.secondary" variant="body2">
                      {paths.length === 0
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
                              setPathsOpen(true);
                              setOpenPathId(result.value.path.id);
                              await refreshPaths();
                            });
                        }}
                      >
                        {editingPathId ? "Update path" : "Add path"}
                      </Button>
                      {editingPathId ? (
                        <Button
                          variant="text"
                          onClick={() => {
                            setEditingPathId(null);
                            setPathName("");
                            setPathNotes("");
                          }}
                        >
                          Cancel edit
                        </Button>
                      ) : null}
                    </Stack>
                    {pathStatus ? (
                      <Typography role="status" color="text.secondary" variant="body2">
                        {pathStatus}
                      </Typography>
                    ) : null}
                  </Stack>
                </List>
              </Collapse>
            </List>
          ) : (
            <Typography
              color="text.secondary"
              variant="body2"
              sx={{ px: 2, py: 1.5, pl: 5 }}
              data-testid="jj-profile-paths-locked"
            >
              Create your profile first. Paths and resumes will nest under it.
            </Typography>
          )}
        </Collapse>
      </List>
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
