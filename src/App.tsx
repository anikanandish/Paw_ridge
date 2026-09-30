import { useEffect, useMemo, useState } from "react";
import { matchDogs } from "./match";
import { seedDogs, emptyDraft, sexOptions, coatOptions, sizeOptions, sterilizationOptions, adoptionOptions } from "./seed";
import { loadDogs, nextId, saveDogs } from "./storage";
import {
  adoptionLabels,
  sterilizationLabels,
  type AdoptionStatus,
  type Dog,
  type SterilizationStatus,
} from "./types";

type Filter = "all" | "needs_surgery" | "available";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "D").toUpperCase();
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [dogs, setDogs] = useState<Dog[]>(() => {
    const stored = loadDogs();
    return stored.length ? stored : seedDogs;
  });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "report">("view");
  const [draft, setDraft] = useState(emptyDraft);

  useEffect(() => {
    saveDogs(dogs);
  }, [dogs]);

  const selected = dogs.find((dog) => dog.id === selectedId) ?? null;

  const stats = useMemo(
    () => ({
      total: dogs.length,
      needSurgery: dogs.filter((d) => d.sterilization === "needs_surgery").length,
      scheduled: dogs.filter((d) => d.sterilization === "camp_scheduled").length,
      adoptable: dogs.filter((d) => d.adoption === "available").length,
    }),
    [dogs],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dogs.filter((dog) => {
      if (filter === "needs_surgery" && dog.sterilization !== "needs_surgery") return false;
      if (filter === "available" && dog.adoption !== "available") return false;
      if (!q) return true;
      return [dog.localName, dog.area, dog.landmark, dog.marks, dog.id].join(" ").toLowerCase().includes(q);
    });
  }, [dogs, filter, query]);

  const hints = useMemo(() => matchDogs(draft, dogs), [draft, dogs]);

  function updateDog(id: string, patch: Partial<Dog>) {
    setDogs((prev) =>
      prev.map((dog) => (dog.id === id ? { ...dog, ...patch, updatedAt: new Date().toISOString() } : dog)),
    );
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    const photoDataUrl = await fileToDataUrl(file);
    setDraft((prev) => ({ ...prev, photoDataUrl }));
  }

  function submitReport() {
    const id = nextId(dogs);
    const now = new Date().toISOString();
    const dog: Dog = {
      ...draft,
      localName: draft.localName.trim() || "Unnamed",
      id,
      createdAt: now,
      updatedAt: now,
    };
    setDogs((prev) => [dog, ...prev]);
    setSelectedId(id);
    setMode("view");
    setDraft(emptyDraft);
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <div className="badge" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <circle cx="12" cy="14" r="2.2" fill="#F4C84A" />
              <circle cx="52" cy="18" r="2" fill="#D7C4FF" />
              <circle cx="50" cy="48" r="1.8" fill="#B8F0C4" />
              <path
                d="M18 40c2-10 8-16 14-16 7 0 12 7 14 16-6 2-22 2-28 0Z"
                stroke="#fff"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M24 30c-4-8-1-14 3-14s5 7 2 14" stroke="#fff" strokeWidth="2.2" />
              <path d="M40 30c4-8 1-14-3-14s-5 7-2 14" stroke="#fff" strokeWidth="2.2" />
              <circle cx="28" cy="38" r="1.6" fill="#fff" />
              <circle cx="36" cy="38" r="1.6" fill="#fff" />
              <path d="M18 42 46 36" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1>Paw Ridge</h1>
            <p>
              Identify street dogs in your area, keep sterilization status current, and track who is a
              community dog versus ready for a home.
            </p>
          </div>
        </div>
        <button
          className="btn primary"
          onClick={() => {
            setMode("report");
            setSelectedId(null);
          }}
        >
          Report a dog
        </button>
      </header>

      <section className="stats">
        <div className="stat">
          <strong>{stats.total}</strong>
          <span>Dogs on the ridge</span>
        </div>
        <div className="stat">
          <strong>{stats.needSurgery}</strong>
          <span>Need sterilization</span>
        </div>
        <div className="stat">
          <strong>{stats.scheduled}</strong>
          <span>Camp scheduled</span>
        </div>
        <div className="stat">
          <strong>{stats.adoptable}</strong>
          <span>Ready for adoption</span>
        </div>
      </section>

      <div className="toolbar">
        <input
          className="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, area, marks, or ID"
        />
        <button className={`chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          All
        </button>
        <button
          className={`chip ${filter === "needs_surgery" ? "active" : ""}`}
          onClick={() => setFilter("needs_surgery")}
        >
          Need surgery
        </button>
        <button
          className={`chip ${filter === "available" ? "active" : ""}`}
          onClick={() => setFilter("available")}
        >
          Adoptable
        </button>
      </div>

      <div className="grid">
        <div className="list">
          {visible.length === 0 ? (
            <div className="card empty">No dogs match that search. Report one from the right panel.</div>
          ) : (
            visible.map((dog) => (
              <button
                key={dog.id}
                className={`card dog-card ${selectedId === dog.id ? "selected" : ""}`}
                onClick={() => {
                  setSelectedId(dog.id);
                  setMode("view");
                }}
              >
                <div className="thumb">
                  {dog.photoDataUrl ? <img src={dog.photoDataUrl} alt="" /> : initials(dog.localName)}
                </div>
                <div>
                  <strong>
                    {dog.localName} · {dog.id}
                  </strong>
                  <div>
                    {dog.area}
                    {dog.landmark ? ` · ${dog.landmark}` : ""}
                  </div>
                  <div className="meta">
                    <span className={`tag ${dog.sterilization === "sterilized" ? "done" : "need"}`}>
                      {sterilizationLabels[dog.sterilization]}
                    </span>
                    <span className={`tag ${dog.adoption === "available" || dog.adoption === "adopted" ? "home" : ""}`}>
                      {adoptionLabels[dog.adoption]}
                    </span>
                    {dog.earNotch ? <span className="tag">Ear notch</span> : null}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <aside className="panel">
          {mode === "report" ? (
            <>
              <h2>Identify & report</h2>
              <p>Photo, area, and marks help catchers and feeders recognize the same dog later.</p>
              <div className="form">
                <label>
                  Local name
                  <input
                    value={draft.localName}
                    onChange={(e) => setDraft({ ...draft, localName: e.target.value })}
                    placeholder="What do feeders call this dog?"
                  />
                </label>
                <label>
                  Photo
                  <input type="file" accept="image/*" onChange={(e) => void onPhoto(e.target.files?.[0])} />
                </label>
                <div className="row">
                  <label>
                    Sex
                    <select value={draft.sex} onChange={(e) => setDraft({ ...draft, sex: e.target.value as Dog["sex"] })}>
                      {sexOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Coat
                    <select
                      value={draft.coat}
                      onChange={(e) => setDraft({ ...draft, coat: e.target.value as Dog["coat"] })}
                    >
                      {coatOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="row">
                  <label>
                    Size
                    <select
                      value={draft.size}
                      onChange={(e) => setDraft({ ...draft, size: e.target.value as Dog["size"] })}
                    >
                      {sizeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={draft.earNotch}
                      onChange={(e) => setDraft({ ...draft, earNotch: e.target.checked })}
                    />
                    Already has an ear notch
                  </label>
                </div>
                <label>
                  Area
                  <input
                    value={draft.area}
                    onChange={(e) => setDraft({ ...draft, area: e.target.value })}
                    placeholder="Neighborhood, ward, street"
                  />
                </label>
                <label>
                  Landmark
                  <input
                    value={draft.landmark}
                    onChange={(e) => setDraft({ ...draft, landmark: e.target.value })}
                    placeholder="Temple, tea stall, school gate"
                  />
                </label>
                <label>
                  Distinctive marks
                  <input
                    value={draft.marks}
                    onChange={(e) => setDraft({ ...draft, marks: e.target.value })}
                    placeholder="White chest, limp, collar, injury"
                  />
                </label>

                {hints.length > 0 ? (
                  <div className="hint">
                    <strong>Possible same dog</strong>
                    {hints.map((hint) => (
                      <div key={hint.dog.id}>
                        {hint.dog.localName} ({hint.dog.id}) — {hint.reasons.join(", ")}
                        <div>
                          <button
                            className="btn ghost"
                            onClick={() => {
                              setSelectedId(hint.dog.id);
                              setMode("view");
                            }}
                          >
                            Open existing record
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <label>
                  Sterilization
                  <select
                    value={draft.sterilization}
                    onChange={(e) =>
                      setDraft({ ...draft, sterilization: e.target.value as SterilizationStatus })
                    }
                  >
                    {sterilizationOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {sterilizationLabels[opt]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Adoption status
                  <select
                    value={draft.adoption}
                    onChange={(e) => setDraft({ ...draft, adoption: e.target.value as AdoptionStatus })}
                  >
                    {adoptionOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {adoptionLabels[opt]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Notes
                  <textarea
                    value={draft.notes}
                    onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                    placeholder="Temperament, pups, feeder contacts"
                  />
                </label>
                <div className="actions">
                  <button className="btn primary" onClick={submitReport}>
                    Save dog
                  </button>
                  <button className="btn" onClick={() => setMode("view")}>
                    Cancel
                  </button>
                </div>
              </div>
            </>
          ) : selected ? (
            <div className="detail">
              <h2>
                {selected.localName}{" "}
                <span style={{ color: "var(--muted)", fontSize: "1rem" }}>{selected.id}</span>
              </h2>
              <div className="thumb" style={{ width: 140, height: 140, marginBottom: 12 }}>
                {selected.photoDataUrl ? (
                  <img src={selected.photoDataUrl} alt={selected.localName} />
                ) : (
                  initials(selected.localName)
                )}
              </div>
              <p>
                {selected.sex} · {selected.coat} · {selected.size}
                {selected.earNotch ? " · ear notch (likely already sterilized)" : ""}
              </p>
              <p>
                <strong>Where:</strong> {selected.area}
                {selected.landmark ? ` — ${selected.landmark}` : ""}
              </p>
              <p>
                <strong>Marks:</strong> {selected.marks || "None recorded"}
              </p>
              <label>
                Sterilization
                <select
                  value={selected.sterilization}
                  onChange={(e) =>
                    updateDog(selected.id, { sterilization: e.target.value as SterilizationStatus })
                  }
                >
                  {sterilizationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {sterilizationLabels[opt]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Surgery / camp date
                <input
                  type="date"
                  value={selected.sterilizationDate}
                  onChange={(e) => updateDog(selected.id, { sterilizationDate: e.target.value })}
                />
              </label>
              <label>
                Camp note
                <textarea
                  value={selected.campNote}
                  onChange={(e) => updateDog(selected.id, { campNote: e.target.value })}
                />
              </label>
              <label>
                Adoption
                <select
                  value={selected.adoption}
                  onChange={(e) => updateDog(selected.id, { adoption: e.target.value as AdoptionStatus })}
                >
                  {adoptionOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {adoptionLabels[opt]}
                    </option>
                  ))}
                </select>
              </label>
              <p>
                <strong>Notes:</strong> {selected.notes || "—"}
              </p>
              <div className="actions">
                <button className="btn primary" onClick={() => setMode("report")}>
                  Report another
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2>How this helps</h2>
              <p>Feeders report a dog once. Catchers see who still needs ABC surgery. Homes can find dogs marked ready for adoption.</p>
              <p>Records stay in this browser for now, so you can try the workflow before wiring a shared database.</p>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
