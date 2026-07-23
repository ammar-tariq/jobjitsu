import { useEffect, useRef, useState, type JSX } from "react";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import type { IpcBridge } from "../ipc/bridge.js";
import type {
  DataRootSnapshot,
  PathSnapshot,
  ProfileSnapshot,
  ResumeVersionSnapshot,
  ThemePreference,
} from "../ipc/commands.js";

export type PreferencesViewProps = {
  readonly theme: ThemePreference;
  readonly onThemeChange: (theme: ThemePreference) => void;
  readonly bridge: IpcBridge;
};

/** Preferences — profile, paths, resume library, data folder, appearance; on this device. */
export function PreferencesView({
  theme,
  onThemeChange,
  bridge,
}: PreferencesViewProps): JSX.Element {
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

  const [versions, setVersions] = useState<readonly ResumeVersionSnapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resumeLabel, setResumeLabel] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dataRoot, setDataRoot] = useState<DataRootSnapshot | null>(null);
  const [dataPathDraft, setDataPathDraft] = useState("");
  const [dataStatus, setDataStatus] = useState<string | null>(null);
  const [savingDataRoot, setSavingDataRoot] = useState(false);

  const [requireApproval, setRequireApproval] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [savingApproval, setSavingApproval] = useState(false);

  const [fitKeywordsDraft, setFitKeywordsDraft] = useState("");
  const [toneDraft, setToneDraft] = useState("");
  const [constraintsDraft, setConstraintsDraft] = useState("");
  const [craftStatus, setCraftStatus] = useState<string | null>(null);
  const [savingCraft, setSavingCraft] = useState(false);

  const refreshVersions = async (): Promise<void> => {
    const result = await bridge.listResumeVersions();
    if (result.ok) {
      setVersions(result.value.versions);
      setSelectedId(result.value.selectedId);
    }
  };

  const refreshPaths = async (): Promise<void> => {
    const result = await bridge.listPaths();
    if (result.ok) {
      setPaths(result.value.paths);
      setSelectedPathId(result.value.selectedId);
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
        setSelectedId(result.value.selectedId);
      }
    });
    void bridge.getDataRoot().then((result) => {
      if (!cancelled && result.ok) {
        setDataRoot(result.value.dataRoot);
        setDataPathDraft(result.value.dataRoot.path);
      }
    });
    void bridge.getApprovalBeforeSend().then((result) => {
      if (!cancelled && result.ok) {
        setRequireApproval(result.value.requireApprovalBeforeSend);
      }
    });
    void bridge.getCraftPreferences().then((result) => {
      if (!cancelled && result.ok) {
        setFitKeywordsDraft(result.value.craft.fitKeywords.join(", "));
        setToneDraft(result.value.craft.tone);
        setConstraintsDraft(result.value.craft.constraints.join(", "));
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

  const onImportResume = (): void => {
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
        }),
      )
      .then(async (result) => {
        setImporting(false);
        if (!result.ok) {
          setImportStatus(result.error.message ?? result.error.title);
          return;
        }
        setResumeLabel("");
        setResumeFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setImportStatus(`Imported "${result.value.version.label}" — stored on this device.`);
        await refreshVersions();
      })
      .catch(() => {
        setImporting(false);
        setImportStatus("Something went wrong importing that file. Try again.");
      });
  };

  const onSelectResume = (resumeId: string): void => {
    setSelectingId(resumeId);
    setImportStatus(null);
    void bridge.selectResume(resumeId).then((result) => {
      setSelectingId(null);
      if (!result.ok) {
        setImportStatus(result.error.message ?? result.error.title);
        return;
      }
      setSelectedId(result.value.version.id);
      setImportStatus(`Selected “${result.value.version.label}” — nothing was sent.`);
    });
  };

  const onSaveDataRoot = (): void => {
    setSavingDataRoot(true);
    setDataStatus(null);
    void bridge.setDataRoot(dataPathDraft).then((result) => {
      setSavingDataRoot(false);
      if (!result.ok) {
        setDataStatus(result.error.message ?? result.error.title);
        return;
      }
      setDataRoot(result.value.dataRoot);
      setDataPathDraft(result.value.dataRoot.path);
      setDataStatus("Data folder updated — still on this device.");
    });
  };

  const onPickDataRoot = (): void => {
    setSavingDataRoot(true);
    setDataStatus(null);
    void bridge.pickDataRoot().then((result) => {
      setSavingDataRoot(false);
      if (!result.ok) {
        setDataStatus(result.error.message ?? result.error.title);
        return;
      }
      if (result.value.cancelled || !result.value.dataRoot) {
        setDataStatus("No folder selected.");
        return;
      }
      setDataRoot(result.value.dataRoot);
      setDataPathDraft(result.value.dataRoot.path);
      setDataStatus("Data folder updated — still on this device.");
    });
  };

  const onResetDataRoot = (): void => {
    setSavingDataRoot(true);
    setDataStatus(null);
    void bridge.resetDataRoot().then((result) => {
      setSavingDataRoot(false);
      if (!result.ok) {
        setDataStatus(result.error.message ?? result.error.title);
        return;
      }
      setDataRoot(result.value.dataRoot);
      setDataPathDraft(result.value.dataRoot.path);
      setDataStatus("Restored the default data folder on this device.");
    });
  };

  const onApprovalChange = (_event: unknown, checked: boolean): void => {
    setSavingApproval(true);
    setApprovalStatus(null);
    setRequireApproval(checked);
    void bridge.setApprovalBeforeSend(checked).then((result) => {
      setSavingApproval(false);
      if (!result.ok) {
        setRequireApproval(!checked);
        setApprovalStatus(result.error.message ?? result.error.title);
        return;
      }
      setRequireApproval(result.value.requireApprovalBeforeSend);
      setApprovalStatus(
        result.value.requireApprovalBeforeSend
          ? "Approval before send is on — you stay in control of outbound actions."
          : "Approval before send is off — you can turn it back on anytime.",
      );
    });
  };

  const onSaveCraftPreferences = (): void => {
    setSavingCraft(true);
    setCraftStatus(null);
    void bridge
      .setCraftPreferences({
        fitKeywords: splitList(fitKeywordsDraft),
        tone: toneDraft,
        constraints: splitList(constraintsDraft),
      })
      .then((result) => {
        setSavingCraft(false);
        if (!result.ok) {
          setCraftStatus(result.error.message ?? result.error.title);
          return;
        }
        setFitKeywordsDraft(result.value.craft.fitKeywords.join(", "));
        setToneDraft(result.value.craft.tone);
        setConstraintsDraft(result.value.craft.constraints.join(", "));
        setCraftStatus("Fit rules saved on this device.");
      });
  };

  return (
    <Stack spacing={3} data-testid="jj-preferences" sx={{ maxWidth: "40rem" }}>
      <Stack spacing={1}>
        <Typography component="h2" variant="h2">
          Preferences
        </Typography>
        <Typography color="text.secondary">
          Profile, paths, resume library, fit rules, send approval, data folder, and appearance stay
          on this device. Nothing is uploaded to a JobJitsu cloud.
        </Typography>
      </Stack>

      <Stack spacing={1.5} data-testid="jj-approval-before-send">
        <Typography component="h3" variant="body2" color="text.secondary">
          Send approval
        </Typography>
        <Typography color="text.secondary" variant="body2">
          When this is on, JobJitsu waits for your approval before any outbound send. Default is on
          for new installs.
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={requireApproval}
              onChange={onApprovalChange}
              disabled={savingApproval}
              slotProps={{ input: { "aria-label": "Require approval before send" } }}
            />
          }
          label="Require approval before send"
        />
        {approvalStatus ? (
          <Typography role="status" color="text.secondary" variant="body2">
            {approvalStatus}
          </Typography>
        ) : null}
      </Stack>

      <Stack spacing={1.5} data-testid="jj-craft-preferences">
        <Typography component="h3" variant="body2" color="text.secondary">
          Fit, tone, and constraints
        </Typography>
        <Typography color="text.secondary" variant="body2">
          These guide curation and drafts on this device. They never pressure you to apply faster or
          send more.
        </Typography>
        <TextField
          label="Fit keywords"
          value={fitKeywordsDraft}
          onChange={(event) => setFitKeywordsDraft(event.target.value)}
          size="small"
          fullWidth
          helperText="Comma-separated themes you care about — for example remote, platform, design systems."
        />
        <TextField
          label="Tone"
          value={toneDraft}
          onChange={(event) => setToneDraft(event.target.value)}
          size="small"
          fullWidth
          helperText="How drafts should sound — for example calm and precise."
        />
        <TextField
          label="Constraints"
          value={constraintsDraft}
          onChange={(event) => setConstraintsDraft(event.target.value)}
          size="small"
          fullWidth
          helperText="Hard limits, comma-separated — for example no relocate, no unpaid trials."
        />
        <Button variant="contained" onClick={onSaveCraftPreferences} disabled={savingCraft}>
          Save fit rules
        </Button>
        {craftStatus ? (
          <Typography role="status" color="text.secondary" variant="body2">
            {craftStatus}
          </Typography>
        ) : null}
      </Stack>

      <Stack
        spacing={1.5}
        component="form"
        data-testid="jj-profile-form"
        onSubmit={(e) => e.preventDefault()}
      >
        <Typography component="h3" variant="body2" color="text.secondary">
          Profile
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
          Career faces under this profile (for example Fullstack Developer or Mobile App). Selecting
          a path stays on this device and does not send anything.
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
          <List dense disablePadding data-testid="jj-path-list">
            {paths.map((path) => {
              const isSelected = path.id === selectedPathId;
              return (
                <ListItem
                  key={path.id}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
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
                            setPathStatus("Path archived. Stored on this device.");
                            await refreshPaths();
                          });
                        }}
                      >
                        Archive
                      </Button>
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={path.name}
                    secondary={path.notes ?? (isSelected ? "Active path" : undefined)}
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography color="text.secondary" variant="body2">
            No paths yet. Add one for each career face you want to keep under this profile.
          </Typography>
        )}
      </Stack>

      <Stack spacing={1.5} data-testid="jj-resume-library">
        <Typography component="h3" variant="body2" color="text.secondary">
          Resume library
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Import and select a resume version. Selection stays on this device and does not send
          anything.
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
            accept=".pdf,.doc,.docx,.txt,.md,.html,text/plain,application/pdf"
            data-testid="jj-resume-file-input"
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null;
              setResumeFile(next);
              if (next && !resumeLabel.trim()) {
                setResumeLabel(next.name.replace(/\.[^.]+$/, ""));
              }
            }}
          />
        </Button>
        <Button variant="contained" onClick={onImportResume} disabled={importing || !resumeFile}>
          Import resume
        </Button>
        {importStatus ? (
          <Typography role="status" color="text.secondary" variant="body2">
            {importStatus}
          </Typography>
        ) : null}
        {versions.length > 0 ? (
          <List dense disablePadding data-testid="jj-resume-version-list">
            {versions.map((version) => {
              const isSelected = version.id === selectedId;
              return (
                <ListItem
                  key={version.id}
                  disableGutters
                  secondaryAction={
                    <Button
                      size="small"
                      variant={isSelected ? "outlined" : "contained"}
                      disabled={isSelected || selectingId === version.id}
                      onClick={() => onSelectResume(version.id)}
                      aria-label={isSelected ? `Selected ${version.label}` : `Use ${version.label}`}
                    >
                      {isSelected ? "Selected" : "Use"}
                    </Button>
                  }
                  sx={{ pr: 12 }}
                >
                  <ListItemText
                    primary={version.label}
                    secondary={`${version.fileName ?? "file"}${
                      version.parentVersionId ? " · forked" : ""
                    } · ${new Date(version.createdAt).toLocaleString()}`}
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography color="text.secondary" variant="body2">
            No resumes imported yet.
          </Typography>
        )}
      </Stack>

      <Stack spacing={1.5} data-testid="jj-data-folder">
        <Typography component="h3" variant="body2" color="text.secondary">
          Data folder
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Profile, resumes, and preferences are saved as files in this folder on this device. Choose
          a location you control — for example an encrypted volume or backup drive.
        </Typography>
        {dataRoot ? (
          <Typography color="text.secondary" variant="body2" data-testid="jj-data-folder-default">
            Default: {dataRoot.defaultPath}
          </Typography>
        ) : null}
        <TextField
          label="Current folder"
          value={dataPathDraft}
          onChange={(event) => setDataPathDraft(event.target.value)}
          size="small"
          fullWidth
          spellCheck={false}
          autoComplete="off"
          helperText="Use Choose folder for a native picker, or type a path if you prefer."
        />
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={onPickDataRoot}
            disabled={savingDataRoot}
            data-testid="jj-choose-data-folder"
          >
            Choose folder
          </Button>
          <Button
            variant="outlined"
            onClick={onSaveDataRoot}
            disabled={savingDataRoot || dataPathDraft.trim().length === 0}
          >
            Save path
          </Button>
          <Button
            variant="outlined"
            onClick={onResetDataRoot}
            disabled={savingDataRoot || !dataRoot?.isCustom}
          >
            Use default
          </Button>
        </Stack>
        {dataStatus ? (
          <Typography role="status" color="text.secondary" variant="body2">
            {dataStatus}
          </Typography>
        ) : null}
      </Stack>

      <Stack spacing={1}>
        <Typography component="h3" variant="body2" color="text.secondary">
          Appearance
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Dark is the default.
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          color="primary"
          value={theme}
          aria-label="Appearance"
          onChange={(_event, next: ThemePreference | null) => {
            if (next) {
              onThemeChange(next);
            }
          }}
        >
          <ToggleButton value="dark" aria-label="Dark">
            Dark
          </ToggleButton>
          <ToggleButton value="light" aria-label="Light">
            Light
          </ToggleButton>
        </ToggleButtonGroup>
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

function splitList(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
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
