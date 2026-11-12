import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, StickyNote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGoogleSheets } from "@/components/GoogleSheetsGate";

type PlannerNote = { id: number; date: string; text: string };

const localDateKey = (date: Date) => {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 10);
};

const TaskPlanner = () => {
  const { data, saveTable } = useGoogleSheets();
  const today = localDateKey(new Date());
  const [notes, setNotes] = useState<PlannerNote[]>(() => data.PlannerNotes as unknown as PlannerNote[]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [noteText, setNoteText] = useState("");

  useEffect(() => { saveTable("PlannerNotes", notes); }, [notes, saveTable]);

  const monthLabel = month.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  const firstWeekday = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const selectedNotes = notes.filter(note => note.date === selectedDate);

  const saveNote = () => {
    if (!noteText.trim()) return;
    setNotes(current => [...current, { id: Date.now(), date: selectedDate, text: noteText.trim() }]);
    setNoteText("");
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-7">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[.15em] text-[#8b9b95]">PLANLAMA</p>
        <h1 className="font-serif text-[32px] font-semibold tracking-tight text-[#263a35]">Yapılacak İşler</h1>
        <p className="mt-1.5 text-[13px] text-[#82918c]">Takviminizi planlayın, tarihlere notlar ekleyin.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,.9fr)]">
        <section className="rounded-2xl border border-[#e7ece9] bg-white p-5 md:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold capitalize text-[#344842]">{monthLabel}</h2>
              <p className="mt-1 text-xs text-[#8b9a95]">Not eklemek için bir tarih seçin.</p>
            </div>
            <div className="flex gap-1">
              <Button aria-label="Önceki ay" variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={16} /></Button>
              <Button aria-label="Sonraki ay" variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={16} /></Button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"].map(day => <span key={day} className="py-2 text-[10px] font-bold uppercase text-[#94a19c]">{day}</span>)}
            {Array.from({ length: 42 }, (_, index) => {
              const dayNumber = index - firstWeekday + 1;
              const inMonth = dayNumber > 0 && dayNumber <= daysInMonth;
              const date = new Date(month.getFullYear(), month.getMonth(), dayNumber);
              const key = localDateKey(date);
              const hasNote = notes.some(note => note.date === key);
              const dayStyle = !inMonth ? "invisible" : selectedDate === key ? "bg-[#247b78] font-semibold text-white" : key === today ? "bg-[#eaf3f1] font-semibold text-[#247b78] hover:bg-[#dcece7]" : "text-[#53645e] hover:bg-[#f2f6f4]";
              return <button key={index} disabled={!inMonth} aria-label={inMonth ? `Tarih ${key}` : undefined} onClick={() => setSelectedDate(key)} className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-xs transition sm:h-11 sm:w-11 ${dayStyle}`}>
                {inMonth ? dayNumber : ""}
                {hasNote && <i className={`absolute bottom-1 h-1 w-1 rounded-full ${selectedDate === key ? "bg-white" : "bg-[#d18c52]"}`} />}
              </button>;
            })}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-[#edf0ee] pt-4">
            <span className="text-[11px] text-[#87958f]">Turuncu nokta, not bulunan tarihleri gösterir.</span>
            <Button variant="outline" onClick={() => { setMonth(new Date()); setSelectedDate(today); }} className="h-8 rounded-lg px-3 text-[11px]">Bugün</Button>
          </div>
        </section>
        <section className="rounded-2xl border border-[#e7ece9] bg-white p-5 md:p-7">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3f1] text-[#247b78]"><StickyNote size={18} /></span>
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#344842]">Notlar</h2>
              <p className="mt-1 text-xs text-[#8b9a95]">{selectedDate.split("-").reverse().join("/")}</p>
            </div>
          </div>
          <label className="mb-4 block text-xs font-semibold text-[#53645e]">Not tarihi
            <input aria-label="Not tarihi" type="date" lang="tr" value={selectedDate} onChange={event => { const value = event.target.value; setSelectedDate(value); const [year, monthNumber] = value.split("-").map(Number); setMonth(new Date(year, monthNumber - 1, 1)); }} className="mt-1.5 h-10 w-full rounded-xl border border-[#e4ebe7] bg-white px-3 text-[13px] outline-none focus:border-[#76aaa0]" />
          </label>
          <label className="block text-xs font-semibold text-[#53645e]">Yeni not
            <textarea aria-label="Yeni not" value={noteText} onChange={event => setNoteText(event.target.value)} placeholder="Bu tarih için notunuzu yazın..." rows={3} className="mt-1.5 w-full resize-y rounded-xl border border-[#e4ebe7] p-3 text-[13px] font-normal outline-none placeholder:text-[#a5b0ac] focus:border-[#76aaa0]" />
          </label>
          <Button onClick={saveNote} disabled={!noteText.trim()} className="mt-3 w-full rounded-xl bg-[#247b78] hover:bg-[#1c6966]"><Plus size={15} className="mr-2" />Notu kaydet</Button>
          <div className="mt-6 border-t border-[#edf0ee] pt-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#81908a]">Seçili tarihin notları <span className="ml-1 rounded-full bg-[#eaf3f1] px-2 py-0.5 text-[#247b78]">{selectedNotes.length}</span></h3>
            {selectedNotes.length === 0 ? <div className="rounded-xl bg-[#fafbfa] px-4 py-7 text-center text-xs text-[#8b9a95]">Bu tarih için kayıtlı not yok.</div> : <ul className="space-y-2">{selectedNotes.map(note => <li key={note.id} className="flex items-start justify-between gap-3 rounded-xl border border-[#edf0ee] p-3"><p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#485a54]">{note.text}</p><button aria-label="Notu sil" onClick={() => setNotes(current => current.filter(item => item.id !== note.id))} className="shrink-0 rounded-lg p-1.5 text-[#9aa6a1] hover:bg-[#f5f7f6] hover:text-[#b45e4d]"><Trash2 size={14} /></button></li>)}</ul>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TaskPlanner;
