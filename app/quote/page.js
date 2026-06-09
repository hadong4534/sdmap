"use client";
import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
const won = (n) => (n || 0).toLocaleString() + "원";

export default function Quote() {
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  function onFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { setPreview(rd.result); setRes(null); setErr(""); };
    rd.readAsDataURL(f);
  }
  async function analyze() {
    if (!preview) return; setBusy(true); setErr(""); setRes(null);
    try {
      const r = await fetch("/api/ai/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: preview }) });
      const j = await r.json();
      if (!r.ok || j.error) setErr(j.error || "분석 실패");
      else setRes(j.data);
    } catch (e) { setErr("네트워크 오류"); }
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-surface md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        <header className="bg-white border-b border-line"><div className="max-w-3xl mx-auto px-4 md:px-8 py-4 font-extrabold text-lg">견적서 AI 분석</div></header>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
          <p className="text-[13px] text-muted mb-4">받은 스드메·웨딩홀 견적서 사진을 올리면, 총 견적·예상 추가금·누락 항목·계약 전 질문을 AI가 분석해드려요.</p>

          <label className="block rounded-2xl border-2 border-dashed border-brand-200 bg-white p-6 text-center cursor-pointer">
            {preview ? <img src={preview} alt="견적서" className="max-h-60 mx-auto rounded-lg" /> : <><div className="flex justify-center text-brand-500"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></svg></div><div className="font-extrabold text-ink mt-2">견적서 사진 / 캡처 올리기</div><div className="text-[12px] text-muted mt-1">탭하여 카메라 촬영 또는 파일 선택</div></>}
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>

          {preview && <button onClick={analyze} disabled={busy} className="w-full mt-3 h-12 rounded-xl bg-brand-grad text-white font-extrabold disabled:opacity-60">{busy ? "AI 분석 중... (최대 30초)" : "AI로 분석하기"}</button>}
          {err && <p className="mt-3 text-[13px] text-risk bg-[#FFF1EC] rounded-lg px-3 py-2">{err}</p>}

          {res && (
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-line bg-white p-4">
                <div className="text-[13px] text-muted font-bold">{res.vendorName || "분석 결과"}</div>
                <div className="flex items-end gap-3 mt-1"><div><div className="text-[11px] text-muted">총 견적</div><div className="text-xl font-extrabold text-ink">{won(res.total)}</div></div><div><div className="text-[11px] text-muted">예상 추가금</div><div className="text-xl font-extrabold text-risk">+{won(res.extraEstimate)}</div></div></div>
                {res.summary && <p className="text-[13px] text-body mt-3 bg-surface rounded-lg p-3">{res.summary}</p>}
              </div>
              <div className="rounded-2xl border border-line bg-white p-4">
                <div className="font-extrabold text-ink text-sm mb-2">추가금 위험도 {res.riskScore}/100</div>
                <div className="h-2 rounded-full bg-line overflow-hidden"><div className="h-full rounded-full" style={{ width: `${res.riskScore||0}%`, background: res.riskScore>=70?"#FF8A65":res.riskScore>=45?"#E0A12E":"#41C7A7" }} /></div>
              </div>
              {res.missingItems?.length > 0 && <div className="rounded-2xl border border-line bg-white p-4"><div className="font-extrabold text-ink text-sm mb-2">⚠️ 누락 / 미포함 의심 항목</div><ul className="space-y-1.5">{res.missingItems.map((m, i) => (<li key={i} className="text-[13px]"><b className="text-risk">{m.name}</b> <span className="text-muted">— {m.reason}</span></li>))}</ul></div>}
              {res.includedItems?.length > 0 && <div className="rounded-2xl border border-line bg-white p-4"><div className="font-extrabold text-ink text-sm mb-2">✓ 포함 항목</div><ul className="space-y-1">{res.includedItems.map((m, i) => (<li key={i} className="text-[13px] text-body">· {m}</li>))}</ul></div>}
              {res.contractQuestions?.length > 0 && <div className="rounded-2xl border border-line bg-white p-4"><div className="font-extrabold text-ink text-sm mb-2">계약 전 꼭 물어볼 질문</div><ul className="space-y-1.5">{res.contractQuestions.map((q, i) => (<li key={i} className="text-[13px] text-body"><span className="text-brand-500 font-bold">Q{i+1}.</span> {q}</li>))}</ul></div>}
            </div>
          )}
        </div>
      </div>
      <TabBar active="home" />
    </div>
  );
}
