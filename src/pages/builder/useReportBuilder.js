import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { GlobalContext } from "../../context";
import { api } from "../../services/api";
import { THEMES } from "./builderConfig";

const MAX_HISTORY = 30;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function useReportBuilder(reportId) {
  const { token } = useContext(GlobalContext);
  const toast = useToast();

  const [reportMeta, setReportMeta] = useState({ title: "Untitled Report", description: "" });
  const [widgets, setWidgets] = useState([]);
  const [theme, setTheme] = useState(THEMES.modern);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedReportId, setSavedReportId] = useState(reportId || null);
  const [lastSaved, setLastSaved] = useState(null);

  // Undo/redo stacks store snapshots of widgets
  const historyRef = useRef([]);
  const futureRef = useRef([]);

  function snapshot(current) {
    historyRef.current = [...historyRef.current.slice(-MAX_HISTORY), JSON.stringify(current)];
    futureRef.current = [];
  }

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current.pop();
    futureRef.current = [JSON.stringify(widgets), ...futureRef.current];
    setWidgets(JSON.parse(prev));
  }, [widgets]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.shift();
    historyRef.current = [...historyRef.current, JSON.stringify(widgets)];
    setWidgets(JSON.parse(next));
  }, [widgets]);

  // Load existing report
  useEffect(() => {
    if (!reportId || !token) return;
    setIsLoading(true);
    api.getReport(reportId, token)
      .then((r) => {
        setReportMeta({ title: r.title, description: r.description });
        setWidgets(r.widgets || []);
        const t = THEMES[r.theme?.name] || r.theme || THEMES.modern;
        setTheme(t);
        setSavedReportId(r._id);
      })
      .catch((err) => toast({ title: "Failed to load report", description: err.message, status: "error", duration: 3000 }))
      .finally(() => setIsLoading(false));
  }, [reportId, token]); // eslint-disable-line

  // Autosave every 30s when there are widgets
  useEffect(() => {
    if (!savedReportId || widgets.length === 0) return;
    const timer = setTimeout(() => save(true), 30000);
    return () => clearTimeout(timer);
  }); // eslint-disable-line

  const save = useCallback(async (silent = false) => {
    setIsSaving(true);
    try {
      const payload = {
        title: reportMeta.title,
        description: reportMeta.description,
        widgets,
        theme: { ...theme, name: Object.keys(THEMES).find((k) => THEMES[k].name === theme.name) || "modern" },
      };
      let result;
      if (savedReportId) {
        result = await api.updateReport(savedReportId, payload, token);
      } else {
        result = await api.createReport(payload, token);
        setSavedReportId(result._id);
      }
      setLastSaved(new Date());
      if (!silent) toast({ title: "Report saved", status: "success", duration: 2000 });
    } catch (err) {
      if (!silent) toast({ title: "Save failed", description: err.message, status: "error", duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  }, [reportMeta, widgets, theme, savedReportId, token, toast]);

  const addWidget = useCallback((type, config = {}) => {
    snapshot(widgets);
    const newWidget = { id: uid(), type, config, title: "" };
    setWidgets((prev) => [...prev, newWidget]);
    setSelectedId(newWidget.id);
  }, [widgets]);

  const removeWidget = useCallback((id) => {
    snapshot(widgets);
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  }, [widgets]);

  const duplicateWidget = useCallback((id) => {
    snapshot(widgets);
    setWidgets((prev) => {
      const idx = prev.findIndex((w) => w.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: uid() };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, [widgets]);

  const updateWidget = useCallback((id, patch) => {
    setWidgets((prev) => prev.map((w) => w.id === id ? { ...w, ...patch, config: { ...w.config, ...patch.config } } : w));
  }, []);

  const reorderWidgets = useCallback((newOrder) => {
    snapshot(widgets);
    setWidgets(newOrder);
  }, [widgets]);

  const applyTheme = useCallback((themeKey) => {
    setTheme(THEMES[themeKey] || THEMES.modern);
  }, []);

  const applyTemplate = useCallback((template) => {
    snapshot(widgets);
    setWidgets(template.widgets.map((w) => ({ ...w, id: uid() })));
    setTheme(THEMES[template.theme] || THEMES.modern);
    setReportMeta((m) => ({ ...m, title: template.name }));
    setSelectedId(null);
  }, [widgets]);

  const canUndo = historyRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  return {
    reportMeta, setReportMeta,
    widgets, setWidgets,
    theme, setTheme, applyTheme,
    selectedId, setSelectedId,
    isLoading, isSaving, lastSaved,
    savedReportId,
    addWidget, removeWidget, duplicateWidget, updateWidget, reorderWidgets,
    applyTemplate,
    save, undo, redo, canUndo, canRedo,
  };
}
