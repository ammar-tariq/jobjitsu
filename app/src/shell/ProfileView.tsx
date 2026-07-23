import { useEffect, useRef, useState, type JSX } from "react";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type { PathSnapshot, ProfileSnapshot, ResumeVersionSnapshot } from "../ipc/commands.js";

export type ProfileViewProps = {
  readonly bridge: IpcBridge;
};

/**
 * Profile — identity + career Paths. Resume import lives on each Path.
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
  const [openPathId, setOpenPathId] = useState<string | null>(null);

  const [versions, setVersions] = useState<readonly ResumeVersionSnapshot[]>([]);
  const [resumeLabel, setResumeLabel] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectingResumeId, setSelectingResumeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setProfile(result.value.profile);
        setStatus("Stored on this device.");
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

  return (
    <Stack spacing={3} data-testid="jj-profile" sx={{ maxWidth: "40rem" }}>
      <Stack spacing={1}>
        <Typography component="h2" variant="h2">
          Profile
        </Typography>
        <Typography color="text.secondary">
          Your identity and career Paths stay on this device. Import a resume under each Path you
          create.
        </Typography>
      </Stack>

      <Stack
        spacing={1.5}
        component="form"
        data-testid="jj-profile-form"
        onSubmit={(e) => e.preventDefault()}
      >
        <Typography component="h3" variant="body2" color="text.secondary">
          Identity
        </Typography>
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
          Save profile
        </Button>
        {status ? (
          <Typography role="status" color="text.secondary" variant="body2">
            {status}
          </Typography>
        ) : null}
        {profile ? (
          <Typography color="text.secondary" variant="body2">
            Last updated {new Date(profile.updatedAt).toLocaleString()}
          </Typography>
        ) : null}
      </Stack>

      <Stack spacing={1.5} data-testid="jj-path-library">
        <Typography component="h3" variant="body2" color="text.secondary">
          Paths
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Career faces under this profile (for example Fullstack Developer or Mobile App). Each Path
          can hold its own resume. Selecting a path does not send anything.
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

        {paths.length > 0 ? (
          <Stack spacing={2}>
            {paths.map((path) => {
              const isSelected = path.id === selectedPathId;
              const isOpen = path.id === openPathId;
              const pathVersions = versions.filter((version) => version.pathId === path.id);
              return (
                <Stack
                  key={path.id}
                  spacing={1.5}
                  data-testid={`jj-path-card-${path.id}`}
                  sx={{
                    borderTop: "1px solid",
                    borderColor: "divider",
                    pt: 2,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", flexWrap: "wrap" }}
                  >
                    <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                      {path.name}
                      {isSelected ? " · Active" : ""}
                    </Typography>
                    <Button
                      size="small"
                      variant={isOpen ? "contained" : "outlined"}
                      onClick={() => {
                        setOpenPathId(isOpen ? null : path.id);
                        setImportStatus(null);
                      }}
                    >
                      {isOpen ? "Hide resumes" : "Resumes"}
                    </Button>
                    <Button
                      size="small"
                      variant={isSelected ? "contained" : "outlined"}
                      disabled={selectingPathId === path.id}
                      onClick={() => {
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
                      onClick={() => {
                        setEditingPathId(path.id);
                        setPathName(path.name);
                        setPathNotes(path.notes ?? "");
                        setPathStatus(null);
                      }}
                    >
                      Rename
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      color="inherit"
                      onClick={() => {
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
                  </Stack>
                  {path.notes ? (
                    <Typography color="text.secondary" variant="body2">
                      {path.notes}
                    </Typography>
                  ) : null}

                  {isOpen ? (
                    <Stack spacing={1.5} data-testid={`jj-path-resumes-${path.id}`}>
                      <Typography color="text.secondary" variant="body2">
                        Import a resume for this Path. Selection stays on this device and does not
                        send anything.
                      </Typography>
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
                      {importStatus ? (
                        <Typography role="status" color="text.secondary" variant="body2">
                          {importStatus}
                        </Typography>
                      ) : null}
                      {pathVersions.length > 0 ? (
                        <List dense disablePadding>
                          {pathVersions.map((version) => {
                            const isResumeSelected = version.id === path.selectedResumeVersionId;
                            return (
                              <ListItem
                                key={version.id}
                                secondaryAction={
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
                                }
                              >
                                <ListItemText
                                  primary={version.label}
                                  secondary={version.fileName}
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      ) : (
                        <Typography color="text.secondary" variant="body2">
                          No resumes for this Path yet.
                        </Typography>
                      )}
                    </Stack>
                  ) : null}
                </Stack>
              );
            })}
          </Stack>
        ) : (
          <Typography color="text.secondary" variant="body2">
            No paths yet. Add one for each career face you want under this profile.
          </Typography>
        )}
      </Stack>
    </Stack>
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
  // jsdom File may lack arrayBuffer — text() is enough for fixture imports in tests.
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
