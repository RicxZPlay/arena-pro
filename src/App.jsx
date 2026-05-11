import React, { useMemo, useState } from "react";

const emptyData = {
  updatedAt: "Aguardando atualização",
  summary: {
    totalBookmakers: 15,
    totalGames: 0,
    surebetsFound: 0,
    bestOdd: null,
    riskProfile: "—",
  },
  bookmakers: [
    { name: "Superbet", games: [] },
    { name: "Estrela Bet", games: [] },
    { name: "Pixbet", games: [] },
    { name: "BR4bet", games: [] },
    { name: "Novibet", games: [] },
    { name: "BetMGM", games: [] },
    { name: "BetBoom", games: [] },
    { name: "Betano", games: [] },
    { name: "bet365", games: [] },
    { name: "Bet Dá Sorte", games: [] },
    { name: "Sportingbet", games: [] },
    { name: "KTO", games: [] },
    { name: "Esportiva Bet", games: [] },
    { name: "Betnacional", games: [] },
    { name: "multibet", games: [] },
  ],
  surebets: [],
  tips: [],
  bestGames: [],
  lucky: [],
  warnings: [
    "Odds podem mudar rapidamente. Confirme sempre antes de apostar.",
    "Não há lucro garantido. Use gestão de banca e aposte com responsabilidade.",
  ],
};

const tabs = [
  { id: "bookmakers", label: "Casas & Jogos", icon: "🏆" },
  { id: "surebets", label: "Surebets", icon: "🛡️" },
  { id: "tips", label: "Dicas", icon: "🎯" },
  { id: "best", label: "Melhores Jogos", icon: "📊" },
  { id: "lucky", label: "Sortezinha", icon: "⚡" },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function normalizeData(raw) {
  return {
    updatedAt: raw?.updatedAt || raw?.atualizadoEm || "Sem data informada",
    summary: raw?.summary || raw?.resumo || {},
    bookmakers: raw?.bookmakers || raw?.casas || [],
    surebets: raw?.surebets || raw?.possiveisSurebets || [],
    tips: raw?.tips || raw?.dicas || [],
    bestGames: raw?.bestGames || raw?.melhoresJogos || [],
    lucky: raw?.lucky || raw?.sortezinha || [],
    warnings: raw?.warnings || raw?.avisos || [],
  };
}

function ShellCard({ children, theme, className = "" }) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-[1.5rem] border backdrop-blur-xl sm:rounded-[2rem]",
        theme === "dark"
          ? "border-white/10 bg-white/[0.055] text-white shadow-2xl shadow-black/30"
          : "border-slate-200/80 bg-white/75 text-slate-950 shadow-xl shadow-slate-200/60",
        className
      )}
    >
      {children}
    </div>
  );
}

function MetricCard({ icon, label, value, hint, theme }) {
  return (
    <ShellCard theme={theme}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div>
            <p className={cx("text-xs uppercase tracking-[0.28em]", theme === "dark" ? "text-slate-400" : "text-slate-500")}>{label}</p>
            <p className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{value ?? "—"}</p>
            {hint ? <p className={cx("mt-2 text-sm", theme === "dark" ? "text-slate-400" : "text-slate-500")}>{hint}</p> : null}
          </div>
          <div className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg sm:h-12 sm:w-12 sm:text-xl", theme === "dark" ? "bg-emerald-400/10" : "bg-emerald-100")}>{icon}</div>
        </div>
      </div>
    </ShellCard>
  );
}

function SectionHeader({ eyebrow, title, description, theme }) {
  return (
    <div className="mb-4 sm:mb-5">
      <p className={cx("text-[10px] font-bold uppercase tracking-[0.28em] sm:text-xs sm:tracking-[0.35em]", theme === "dark" ? "text-emerald-300" : "text-emerald-700")}>{eyebrow}</p>
      <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl md:text-3xl">{title}</h2>
      {description ? <p className={cx("mt-2 max-w-3xl text-sm leading-6", theme === "dark" ? "text-slate-400" : "text-slate-600")}>{description}</p> : null}
    </div>
  );
}

function EmptyState({ theme, title = "Nenhuma informação disponível", description = "Assim que a rodada for atualizada, os dados desta seção aparecerão aqui." }) {
  return (
    <div className={cx("rounded-3xl border p-8 text-center", theme === "dark" ? "border-white/10 bg-white/[0.035]" : "border-slate-200 bg-white/70")}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-2xl">⚠️</div>
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      <p className={cx("mx-auto mt-2 max-w-xl text-sm", theme === "dark" ? "text-slate-400" : "text-slate-600")}>{description}</p>
    </div>
  );
}

function OddsPill({ label, value, theme }) {
  const displayValue = value === 0 || value ? value : "—";
  const rawLabel = String(label || "—").trim();
  const shortLabel = rawLabel.toLowerCase() === "empate" ? "Empate" : rawLabel.charAt(0).toUpperCase() || "—";

  return (
    <div
      title={rawLabel}
      className={cx(
        "flex h-10 w-full items-center justify-center gap-1.5 rounded-full border px-2 text-[11px] font-black tabular-nums sm:h-11 sm:text-xs lg:h-11 lg:text-sm",
        theme === "dark"
          ? "border-white/10 bg-black/25 text-slate-100"
          : "border-slate-200 bg-white text-slate-800"
      )}
    >
      <span className="shrink-0">{shortLabel}</span>
      <span className="shrink-0">:</span>
      <span className="shrink-0">{displayValue}</span>
    </div>
  );
}

function getHomeTeam(game) {
  const matchText = game?.match || game?.jogo || "";
  const parts = matchText.includes(" x ") ? matchText.split(" x ") : matchText.split(" X ");
  return game?.home || game?.mandante || parts[0] || "Mandante";
}

function getAwayTeam(game) {
  const matchText = game?.match || game?.jogo || "";
  const parts = matchText.includes(" x ") ? matchText.split(" x ") : matchText.split(" X ");
  return game?.away || game?.visitante || parts[1] || "Visitante";
}

function BookmakersTab({ data, theme }) {
  const bookmakers = data.bookmakers || [];
  return (
    <div>
      <SectionHeader
        theme={theme}
        eyebrow="Parte 1"
        title="Jogos disponíveis por casa de aposta"
        description="Cada casa aparece separada com uma visualização compacta dos jogos e odds principais da rodada."
      />
      {bookmakers.length === 0 ? <EmptyState theme={theme} /> : null}
      <div className="grid gap-2 sm:gap-3">
        {bookmakers.map((bookmaker, index) => (
          <ShellCard key={`${bookmaker.name}-${index}`} theme={theme}>
            <div className="p-2.5 sm:p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm sm:h-9 sm:w-9", theme === "dark" ? "bg-emerald-400/10" : "bg-emerald-100")}>👑</div>
                  <div>
                    <h3 className="text-sm font-black sm:text-base">{bookmaker.name || bookmaker.casa || "Casa sem nome"}</h3>
                    <p className={cx("text-xs", theme === "dark" ? "text-slate-400" : "text-slate-500")}>{(bookmaker.games || bookmaker.jogos || []).length} jogos</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-0.5 sm:gap-1">
                {(bookmaker.games || bookmaker.jogos || []).map((game, gameIndex) => (
                  <div
                    key={`${game.match}-${gameIndex}`}
                    className={cx(
                      "rounded-lg border px-2.5 py-1.5 sm:px-3 sm:py-2",
                      theme === "dark"
                        ? "border-white/10 bg-black/20"
                        : "border-slate-200 bg-slate-50/80"
                    )}
                  >
                    <div className="grid gap-1 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <p className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-[10px] lg:text-xs">
                            {game.championship || game.campeonato || "Campeonato não informado"}
                          </p>
                          <span
                            className={cx(
                              "hidden h-1 w-1 rounded-full sm:inline-block",
                              theme === "dark" ? "bg-slate-600" : "bg-slate-400"
                            )}
                          />
                          <p
                            className={cx(
                              "text-[10px] font-semibold lg:text-xs",
                              theme === "dark" ? "text-slate-400" : "text-slate-500"
                            )}
                          >
                            {game.date || game.data || "Data não informada"} • {game.time || game.horario || "Horário não informado"}
                          </p>
                        </div>

                        <h4 className="mt-0.5 text-sm font-black sm:text-base lg:text-lg">
                          {game.match || game.jogo || `${game.home || "Mandante"} x ${game.away || "Visitante"}`}
                        </h4>

                        {(game.notes || game.observacoes) ? (
                          <p
                            className={cx(
                              "mt-1 whitespace-normal break-words text-[10px] leading-4 sm:text-xs sm:leading-5 lg:max-w-4xl lg:text-sm",
                              theme === "dark" ? "text-slate-400" : "text-slate-500"
                            )}
                          >
                            <strong>Obs:</strong> {game.notes || game.observacoes}
                          </p>
                        ) : null}
                      </div>

                      <div className="grid w-full grid-cols-3 gap-2 lg:w-auto lg:grid-cols-[116px_116px_116px]">
                        <OddsPill theme={theme} label={getHomeTeam(game)} value={game.odds?.home || game.odds?.mandante || game.oddMandante} />
                        <OddsPill theme={theme} label="Empate" value={game.odds?.draw || game.odds?.empate || game.oddEmpate} />
                        <OddsPill theme={theme} label={getAwayTeam(game)} value={game.odds?.away || game.odds?.visitante || game.oddVisitante} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ShellCard>
        ))}
      </div>
    </div>
  );
}

function SurebetsTab({ data, theme }) {
  const surebets = data.surebets || [];
  return (
    <div>
      <SectionHeader theme={theme} eyebrow="Parte 2" title="Verificação de possíveis surebets" description="Comparação entre mercados para destacar oportunidades, lucro estimado, divisão de banca e nível de confiança." />
      {surebets.length === 0 ? <EmptyState theme={theme} title="Nenhuma surebet carregada" description="Quando o JSON trouxer oportunidades reais, elas aparecerão aqui com divisão de stake e nível de confiança." /> : null}
      <div className="grid gap-5 lg:grid-cols-2">
        {surebets.map((item, index) => (
          <ShellCard key={`${item.match}-${index}`} theme={theme} className={theme === "dark" ? "bg-emerald-400/[0.06]" : "bg-emerald-50/80"}>
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div>
                  <p className={cx("text-xs font-bold uppercase tracking-[0.28em]", theme === "dark" ? "text-emerald-300" : "text-emerald-700")}>Oportunidade</p>
                  <h3 className="mt-2 text-xl font-black">{item.match || item.jogo}</h3>
                  <p className={cx("mt-1 text-sm", theme === "dark" ? "text-slate-300" : "text-slate-600")}>{item.market || item.mercado}</p>
                </div>
                <div className="shrink-0 rounded-2xl bg-emerald-500 px-3 py-2 text-right text-white shadow-lg shadow-emerald-900/20 sm:px-4 sm:py-3">
                  <p className="text-xs font-bold uppercase tracking-widest">Lucro</p>
                  <p className="text-xl font-black sm:text-2xl">{item.profitPercent || item.lucroPercentual || 0}%</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {(item.stakes || item.divisaoBanca || []).map((stake, stakeIndex) => (
                  <div key={stakeIndex} className={cx("flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-3", theme === "dark" ? "border-white/10 bg-black/20" : "border-emerald-200 bg-white/75")}>
                    <div>
                      <p className="font-bold">{stake.outcome || stake.resultado}</p>
                      <p className={cx("text-sm", theme === "dark" ? "text-slate-400" : "text-slate-600")}>{stake.bookmaker || stake.casa} • odd {stake.odd}</p>
                    </div>
                    <p className="font-black">{stake.stake || stake.valor}</p>
                  </div>
                ))}
              </div>
              {(item.explanation || item.explicacao) ? (
                <p className={cx("mt-4 rounded-2xl px-4 py-3 text-sm leading-6", theme === "dark" ? "bg-black/20 text-slate-300" : "bg-white/70 text-slate-700")}>
                  <strong>Explicação:</strong> {item.explanation || item.explicacao}
                </p>
              ) : null}
              <div className={cx("mt-4 rounded-2xl px-4 py-3 text-sm", theme === "dark" ? "bg-black/20 text-slate-300" : "bg-white/70 text-slate-700")}>Confiança: <strong>{item.confidence || item.confianca || "Não informada"}</strong></div>
            </div>
          </ShellCard>
        ))}
      </div>
    </div>
  );
}

function TipsTab({ data, theme }) {
  const tips = data.tips || [];
  return (
    <div>
      <SectionHeader theme={theme} eyebrow="Parte 3" title="Dicas por estudo e probabilidade" description="Entradas organizadas por mercado recomendado, odd, motivo, risco, probabilidade estimada e estratégia de entrada." />
      {tips.length === 0 ? <EmptyState theme={theme} /> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tips.map((tip, index) => {
          const risk = tip.risk || tip.risco || "Risco";
          const prob = parseFloat(tip.probability || tip.probabilidade || 0) || 48;
          return (
            <ShellCard key={`${tip.match}-${index}`} theme={theme} className="transition duration-300 hover:-translate-y-1">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className={cx("flex h-12 w-12 items-center justify-center rounded-2xl text-xl", theme === "dark" ? "bg-cyan-400/10" : "bg-cyan-100")}>🎯</div>
                  <span className={cx("rounded-full px-3 py-1 text-xs font-black", risk === "Baixo" ? "bg-emerald-500 text-white" : risk === "Alto" ? "bg-rose-500 text-white" : "bg-amber-500 text-white")}>{risk}</span>
                </div>
                <h3 className="mt-4 text-lg font-black sm:text-xl">{tip.match || tip.jogo}</h3>
                <p className={cx("mt-1 text-sm", theme === "dark" ? "text-slate-400" : "text-slate-600")}>{tip.market || tip.mercado} • {tip.bookmaker || tip.casa} {tip.odd ? `@ ${tip.odd}` : ""}</p>
                <p className={cx("mt-4 text-sm leading-6", theme === "dark" ? "text-slate-300" : "text-slate-700")}>{tip.reason || tip.motivo}</p>
                <div className={cx("mt-5 rounded-2xl border p-4", theme === "dark" ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50")}>
                  <div className="flex items-center justify-between text-sm"><span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>Probabilidade</span><strong>{tip.probability || tip.probabilidade || "—"}</strong></div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700/20"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${prob}%` }} /></div>
                </div>
                <p className={cx("mt-4 text-sm", theme === "dark" ? "text-slate-400" : "text-slate-600")}><strong>Entrada:</strong> {tip.entry || tip.entrada || "Não informada"}</p>
                {(tip.protection || tip.protecao) ? (
                  <p className={cx("mt-2 text-sm", theme === "dark" ? "text-slate-400" : "text-slate-600")}><strong>Proteção:</strong> {tip.protection || tip.protecao}</p>
                ) : null}
                {tip.stats ? (
                  <div className={cx("mt-4 rounded-2xl border p-4 text-xs leading-5", theme === "dark" ? "border-white/10 bg-black/20 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600")}>
                    <p className="mb-2 font-black text-current">Resumo estatístico</p>
                    {tip.stats.recentForm ? <p><strong>Forma recente:</strong> {tip.stats.recentForm}</p> : null}
                    {tip.stats.homeAwayPerformance ? <p><strong>Mandante/visitante:</strong> {tip.stats.homeAwayPerformance}</p> : null}
                    {tip.stats.goalsTrend ? <p><strong>Gols:</strong> {tip.stats.goalsTrend}</p> : null}
                    {tip.stats.bothTeamsScoreTrend ? <p><strong>Ambas marcam:</strong> {tip.stats.bothTeamsScoreTrend}</p> : null}
                    {tip.stats.absences ? <p><strong>Desfalques:</strong> {tip.stats.absences}</p> : null}
                    {tip.stats.motivation ? <p><strong>Motivação:</strong> {tip.stats.motivation}</p> : null}
                  </div>
                ) : null}
              </div>
            </ShellCard>
          );
        })}
      </div>
    </div>
  );
}

function BestGamesTab({ data, theme }) {
  const games = data.bestGames || [];
  return (
    <div>
      <SectionHeader theme={theme} eyebrow="Parte 4" title="Melhores jogos do dia e previsão de resultados" description="Jogos com leitura estatística mais clara, cenário provável, placar estimado e mercado de maior aderência." />
      {games.length === 0 ? <EmptyState theme={theme} /> : null}
      <div className="grid gap-5">
        {games.map((game, index) => (
          <ShellCard key={`${game.match}-${index}`} theme={theme}>
            <div className={cx("p-4 sm:p-6", theme === "dark" ? "bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950" : "bg-gradient-to-br from-slate-50 via-white to-emerald-50")}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className={cx("text-xs font-bold uppercase tracking-[0.32em]", theme === "dark" ? "text-emerald-300" : "text-emerald-700")}>{game.championship || game.campeonato}</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{game.match || game.jogo}</h3>
                  <p className={cx("mt-2 text-sm", theme === "dark" ? "text-slate-400" : "text-slate-600")}>{game.dateTime || game.dataHorario}</p>
                </div>
                <div className="w-full rounded-3xl bg-black px-5 py-4 text-center text-white shadow-xl sm:w-auto sm:px-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Placar provável</p>
                  <p className="mt-1 text-3xl font-black">{game.probableScore || game.placarProvavel || "—"}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h4 className="font-black">Análise completa</h4>
                <p className={cx("mt-2 text-sm leading-6", theme === "dark" ? "text-slate-300" : "text-slate-700")}>{game.analysis || game.analise}</p>
                <h4 className="mt-5 font-black">Cenário provável</h4>
                <p className={cx("mt-2 text-sm leading-6", theme === "dark" ? "text-slate-300" : "text-slate-700")}>{game.scenario || game.cenario}</p>
              </div>
              <div className={cx("rounded-3xl border p-5", theme === "dark" ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50")}>
                <p className={cx("text-sm", theme === "dark" ? "text-slate-400" : "text-slate-600")}>Melhor mercado</p>
                <p className="mt-1 text-xl font-black">{game.bestMarket || game.melhorMercado}</p>
                <p className={cx("mt-4 text-sm", theme === "dark" ? "text-slate-400" : "text-slate-600")}>Casa com melhor odd</p>
                <p className="mt-1 font-black">{game.bestBookmaker || game.melhorCasa}</p>
                <p className={cx("mt-4 text-sm", theme === "dark" ? "text-slate-400" : "text-slate-600")}>Odd destacada</p>
                <p className="mt-1 font-black">{game.bestOdd || game.melhorOdd || "—"}</p>
                <p className={cx("mt-4 text-sm", theme === "dark" ? "text-slate-400" : "text-slate-600")}>Confiança</p>
                <p className="mt-1 font-black">{game.confidence || game.confianca}</p>
              </div>
            </div>
          </ShellCard>
        ))}
      </div>
    </div>
  );
}

function LuckyTab({ data, theme }) {
  const lucky = data.lucky || [];
  return (
    <div>
      <SectionHeader theme={theme} eyebrow="Parte 5" title="Sortezinha do Dia" description="Entradas pequenas e agressivas, buscando retorno alto sem abandonar coerência estatística e mercados realistas." />
      {lucky.length === 0 ? <EmptyState theme={theme} /> : null}
      <div className="grid gap-5 lg:grid-cols-2">
        {lucky.map((item, index) => (
          <ShellCard key={`${item.title}-${index}`} theme={theme} className={theme === "dark" ? "bg-fuchsia-400/[0.06]" : "bg-fuchsia-50/80"}>
            <div className="relative p-4 sm:p-6">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-2xl" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={cx("text-xs font-bold uppercase tracking-[0.32em]", theme === "dark" ? "text-fuchsia-300" : "text-fuchsia-700")}>Entrada ousada</p>
                    <h3 className="mt-2 text-xl font-black sm:text-2xl">{item.title || "Sortezinha"}</h3>
                  </div>
                  <div className="text-3xl">⚡</div>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className={cx("rounded-2xl p-4", theme === "dark" ? "bg-black/20" : "bg-white/75")}><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Entrada</p><p className="mt-1 text-2xl font-black">{item.stake || item.valorEntrada || "R$ 5,00"}</p></div>
                  <div className={cx("rounded-2xl p-4", theme === "dark" ? "bg-black/20" : "bg-white/75")}><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Retorno possível</p><p className="mt-1 text-2xl font-black">{item.possibleReturn || item.retornoPossivel}</p></div>
                </div>
                <div className="mt-5"><p className="font-black">Jogos</p><div className="mt-2 flex flex-wrap gap-2">{(item.matches || item.jogos || []).map((match, i) => <span key={i} className={cx("rounded-full px-3 py-1 text-sm font-bold", theme === "dark" ? "bg-white/10" : "bg-white")}>{match}</span>)}</div></div>
                <div className="mt-5"><p className="font-black">Combinações realistas</p><div className="mt-2 flex flex-wrap gap-2">{(item.combinations || item.combinacoes || []).map((combo, i) => <span key={i} className="rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 px-3 py-1 text-sm font-black text-white">{combo}</span>)}</div></div>
                <p className={cx("mt-5 text-sm leading-6", theme === "dark" ? "text-slate-300" : "text-slate-700")}>{item.reason || item.motivo}</p>
                <div className={cx("mt-4 rounded-2xl border p-4 text-sm", theme === "dark" ? "border-white/10 bg-black/20 text-slate-300" : "border-fuchsia-200 bg-white/75 text-slate-700")}>
                  <strong>Risco:</strong> {item.risk || item.risco || "Alto"}<br />
                  <strong>Odd total:</strong> {item.totalOdd || item.oddTotal || "—"}<br />
                  <strong>Casa:</strong> {item.bookmaker || item.casa || "—"}<br />
                  <strong>Justificativa:</strong> {item.statisticalNote || item.justificativaEstatistica}
                </div>
              </div>
            </div>
          </ShellCard>
        ))}
      </div>
    </div>
  );
}

export default function PremiumBetAnalysisApp() {
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("bookmakers");
  const [jsonInput, setJsonInput] = useState(JSON.stringify(emptyData, null, 2));
  const [rawData, setRawData] = useState(emptyData);
  const [parseStatus, setParseStatus] = useState({ type: "success", message: "Estrutura inicial carregada. Publique um JSON para atualizar o painel." });
  const [adminOpen, setAdminOpen] = useState(false);

  const data = useMemo(() => normalizeData(rawData), [rawData]);
  const totalGames = data.bookmakers.reduce((sum, book) => sum + ((book.games || book.jogos || []).length), 0);

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setRawData(parsed);
      setParseStatus({ type: "success", message: "JSON aplicado com sucesso. As abas foram atualizadas." });
    } catch (error) {
      setParseStatus({ type: "error", message: "JSON inválido. Verifique vírgulas, aspas e chaves antes de aplicar." });
    }
  };

  const renderTab = () => {
    if (activeTab === "bookmakers") return <BookmakersTab data={data} theme={theme} />;
    if (activeTab === "surebets") return <SurebetsTab data={data} theme={theme} />;
    if (activeTab === "tips") return <TipsTab data={data} theme={theme} />;
    if (activeTab === "best") return <BestGamesTab data={data} theme={theme} />;
    return <LuckyTab data={data} theme={theme} />;
  };

  const shellClass = theme === "dark"
    ? "min-h-screen bg-[radial-gradient(circle_at_top_left,#164e63_0%,#020617_34%,#020617_100%)] text-white"
    : "min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,#f8fafc_38%,#e2e8f0_100%)] text-slate-950";

  return (
    <div className={cx(shellClass, "overflow-x-hidden")}>
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
        <header className={cx("relative overflow-hidden rounded-[1.5rem] border p-4 sm:rounded-[2rem] sm:p-6 md:p-8", theme === "dark" ? "border-white/10 bg-black/30 shadow-2xl shadow-black/40" : "border-white/80 bg-white/65 shadow-2xl shadow-slate-300/60")}>
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300 shadow-lg shadow-emerald-950/10 sm:mb-5 sm:px-4 sm:py-2 sm:text-sm">⚽ Arena Pro Intelligence</div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-6xl">Arena Pro: inteligência esportiva para leitura de mercado</h1>
              <p className={cx("mt-4 max-w-2xl text-sm leading-6 sm:text-base sm:leading-7 md:text-lg", theme === "dark" ? "text-slate-300" : "text-slate-600")}>Painel premium para acompanhar jogos, comparar mercados, identificar possíveis oportunidades e organizar entradas com foco em estatística, risco e valor esperado.</p>
              <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
                <span className="rounded-full bg-emerald-500 px-3 py-2 text-xs font-black text-white sm:px-4 sm:text-sm">
                  No momento, as atualizações não são automáticas
                </span>
              </div>
            </div>
            <div className={cx("w-full max-w-full sm:max-w-sm rounded-3xl border p-4 sm:p-5", theme === "dark" ? "border-white/10 bg-white/[0.06]" : "border-slate-200 bg-white/75")}>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                <div><p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Atualizado</p><p className="mt-1 text-lg font-black">{data.updatedAt}</p></div>
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className={cx("rounded-2xl px-3 py-2 text-xs font-black transition sm:px-4 sm:text-sm", theme === "dark" ? "bg-white text-slate-950 hover:bg-slate-200" : "bg-slate-950 text-white hover:bg-slate-800")}>{theme === "dark" ? "☀️ Tema claro" : "🌙 Tema escuro"}</button>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3"><div className={cx("rounded-2xl p-4", theme === "dark" ? "bg-black/25" : "bg-slate-50")}><p className="text-xs text-slate-500">Perfil</p><p className="font-black">{data.summary.riskProfile || data.summary.perfilRisco || "—"}</p></div><div className={cx("rounded-2xl p-4", theme === "dark" ? "bg-black/25" : "bg-slate-50")}><p className="text-xs text-slate-500">Melhor odd</p><p className="font-black">{data.summary.bestOdd || data.summary.melhorOdd || "—"}</p></div></div>
            </div>
          </div>
        </header>

        <section className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 xl:grid-cols-4">
          <MetricCard theme={theme} icon="👑" label="Casas" value={data.summary.totalBookmakers || data.bookmakers.length} hint="Fontes da rodada" />
          <MetricCard theme={theme} icon="📈" label="Jogos" value={data.summary.totalGames || totalGames} hint="Eventos monitorados" />
          <MetricCard theme={theme} icon="🛡️" label="Oportunidades" value={data.summary.surebetsFound ?? data.surebets.length} hint="Alertas identificados" />
          <MetricCard theme={theme} icon="💰" label="Sortezinha" value={(data.lucky || []).length} hint="Entradas especiais" />
        </section>

        <section className="mt-4 grid gap-5 sm:mt-6 sm:gap-6">
          <div className="flex w-full flex-col items-end">
            <button onClick={() => setAdminOpen(!adminOpen)} className={cx("mb-2 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] opacity-35 transition hover:opacity-100", theme === "dark" ? "border-white/10 bg-black/10 text-slate-500 hover:bg-white/5 hover:text-slate-300" : "border-slate-200 bg-white/30 text-slate-400 hover:bg-white hover:text-slate-600")}>
              {adminOpen ? "Fechar" : "Admin"}
            </button>
            {adminOpen ? (
              <div className={cx("mt-3 w-full rounded-[1.5rem] border p-3 sm:p-4", theme === "dark" ? "border-white/10 bg-black/20" : "border-slate-200 bg-white/60")}>
                <div className="grid gap-4 xl:grid-cols-[420px_1fr] xl:gap-5">
                  <aside className={cx("h-fit rounded-[1.5rem] border p-4 sm:rounded-[2rem] sm:p-5", theme === "dark" ? "border-white/10 bg-black/25" : "border-white/80 bg-white/65 shadow-xl shadow-slate-200/70")}>
                    <div className="mb-4 flex items-center gap-3">
                      <div className={cx("flex h-12 w-12 items-center justify-center rounded-2xl text-xl", theme === "dark" ? "bg-cyan-400/10" : "bg-cyan-100")}>📋</div>
                      <div>
                        <h2 className="text-xl font-black">Painel de atualização</h2>
                        <p className={cx("text-sm", theme === "dark" ? "text-slate-400" : "text-slate-600")}>Cole os dados estruturados da rodada.</p>
                      </div>
                    </div>

                    <textarea
                      value={jsonInput}
                      onChange={(event) => setJsonInput(event.target.value)}
                      spellCheck={false}
                      className={cx("h-[320px] w-full resize-none rounded-3xl border p-4 font-mono text-[11px] leading-5 outline-none transition focus:ring-2 sm:h-[420px] sm:text-xs", theme === "dark" ? "border-white/10 bg-slate-950/80 text-slate-100 focus:ring-emerald-400/50" : "border-slate-200 bg-slate-50 text-slate-900 focus:ring-emerald-500/30")}
                    />

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <button onClick={applyJson} className="rounded-2xl bg-emerald-500 px-4 py-2 font-black text-white transition hover:bg-emerald-600">✅ Publicar atualização</button>
                      <button
                        onClick={() => {
                          setJsonInput(JSON.stringify(emptyData, null, 2));
                          setRawData(emptyData);
                          setParseStatus({ type: "success", message: "Estrutura vazia restaurada." });
                        }}
                        className={cx("rounded-2xl px-4 py-2 font-black transition", theme === "dark" ? "bg-white/10 text-white hover:bg-white/15" : "bg-slate-900 text-white hover:bg-slate-800")}
                      >
                        Limpar painel
                      </button>
                    </div>

                    <div className={cx("mt-4 rounded-2xl border px-4 py-3 text-sm", parseStatus.type === "success" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-rose-400/30 bg-rose-400/10 text-rose-300")}>
                      {parseStatus.message}
                    </div>

                    <div className={cx("mt-4 rounded-2xl border p-4 text-xs leading-5", theme === "dark" ? "border-white/10 bg-white/[0.035] text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600")}>
                      <strong>Estrutura aceita:</strong> <code>bookmakers/casas</code>, <code>surebets/possiveisSurebets</code>, <code>tips/dicas</code>, <code>bestGames/melhoresJogos</code> e <code>lucky/sortezinha</code>.
                    </div>
                  </aside>

                  <div className={cx("rounded-[1.5rem] border p-4 sm:rounded-[2rem] sm:p-5", theme === "dark" ? "border-white/10 bg-white/[0.035]" : "border-slate-200 bg-slate-50")}>
                    <h3 className="text-xl font-black">Fluxo operacional</h3>
                    <p className={cx("mt-2 text-sm leading-6", theme === "dark" ? "text-slate-400" : "text-slate-600")}>
                      Use esta área apenas para manutenção do painel. Após publicar a atualização, os dados aparecem automaticamente nas abas públicas do dashboard.
                    </p>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <div className={cx("rounded-2xl p-4", theme === "dark" ? "bg-black/20" : "bg-white")}>
                        <strong>1. Coleta</strong>
                        <p className="mt-1 text-sm opacity-70">Reunir odds e mercados.</p>
                      </div>
                      <div className={cx("rounded-2xl p-4", theme === "dark" ? "bg-black/20" : "bg-white")}>
                        <strong>2. Estrutura</strong>
                        <p className="mt-1 text-sm opacity-70">Converter em dados padronizados.</p>
                      </div>
                      <div className={cx("rounded-2xl p-4", theme === "dark" ? "bg-black/20" : "bg-white")}>
                        <strong>3. Publicação</strong>
                        <p className="mt-1 text-sm opacity-70">Atualizar o painel da rodada.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <main className="min-w-0">
            <nav className={cx("sticky top-2 z-20 mb-5 overflow-hidden rounded-[1.5rem] border backdrop-blur-2xl sm:top-4 sm:mb-6 sm:rounded-[2rem]", theme === "dark" ? "border-white/10 bg-black/55 shadow-2xl shadow-black/20" : "border-white/80 bg-white/85 shadow-xl shadow-slate-200/70")}>
              <div className="flex overflow-x-auto no-scrollbar min-w-full gap-2 p-2 md:grid md:min-w-0 md:grid-cols-5">
                {tabs.map((tab) => {
                  const active = activeTab === tab.id;
                  return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cx("flex shrink-0 items-center justify-center gap-2 rounded-3xl px-4 py-3 text-xs font-black transition active:scale-[0.98] sm:text-sm md:px-3", active ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-900/20" : theme === "dark" ? "text-slate-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100")}><span>{tab.icon}</span>{tab.label}</button>;
                })}
              </div>
            </nav>
            <div>{renderTab()}</div>
          </main>
        </section>

        <footer className={cx("mt-6 rounded-[1.5rem] border p-4 sm:mt-8 sm:rounded-[2rem] sm:p-5", theme === "dark" ? "border-white/10 bg-black/25 text-slate-400" : "border-white/80 bg-white/65 text-slate-600")}>
          <div className="mb-4">
            <h3 className={cx("text-base font-black", theme === "dark" ? "text-white" : "text-slate-950")}>Jogo responsável</h3>
            <p className={cx("mt-1 text-sm", theme === "dark" ? "text-slate-400" : "text-slate-600")}>
              As informações apresentadas servem como apoio à análise e tomada de decisão.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className={cx("rounded-2xl px-4 py-3 text-sm", theme === "dark" ? "bg-white/[0.04]" : "bg-slate-50")}>
              Odds podem mudar rapidamente. Confirme sempre antes de apostar.
            </div>
            <div className={cx("rounded-2xl px-4 py-3 text-sm", theme === "dark" ? "bg-white/[0.04]" : "bg-slate-50")}>
              Não há lucro garantido. Use gestão de banca e aposte com responsabilidade.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
