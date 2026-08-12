/**
 * RecallOps SRE Console - Enterprise Client Controller
 * Powers Hindsight Continuous Memory, CascadeFlow Runtime Intelligence,
 * and the Interactive Team Memory Wall.
 */
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Query Console
  const analyzeForm = document.getElementById('analyzeForm');
  const issueInput = document.getElementById('issueInput');
  const btnClearInput = document.getElementById('btnClearInput');
  const btnAnalyze = document.getElementById('btnAnalyze');
  const analyzeSpinner = document.getElementById('analyzeSpinner');
  const telemetryChips = document.querySelectorAll('.t-chip, .preset-launcher');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Layout Viewports
  const standbyState = document.getElementById('standbyState');
  const devopsGrid = document.getElementById('devopsGrid');
  const techIntelligenceBar = document.getElementById('techIntelligenceBar');

  // Dual Technology Proof Chips
  const hindsightModeBadge = document.getElementById('hindsightModeBadge');
  const proofLabel = document.getElementById('proofLabel');
  const proofRecallStatus = document.getElementById('proofRecallStatus');
  const proofReflectStatus = document.getElementById('proofReflectStatus');
  const proofEvidenceCount = document.getElementById('proofEvidenceCount');

  const cascadeModeBadge = document.getElementById('cascadeModeBadge');
  const cascadeModelUsed = document.getElementById('cascadeModelUsed');
  const cascadeSavings = document.getElementById('cascadeSavings');
  const cascadeLatency = document.getElementById('cascadeLatency');
  const cascadeStrategy = document.getElementById('cascadeStrategy');

  // Card 1: Incident Insights
  const frequencyCountDisplay = document.getElementById('frequencyCountDisplay');
  const maxRelevanceDisplay = document.getElementById('maxRelevanceDisplay');
  const statMatchedCount = document.getElementById('statMatchedCount');
  const statSimilarityPct = document.getElementById('statSimilarityPct');
  const statVerifiedCount = document.getElementById('statVerifiedCount');
  const similarIncidentsTableBody = document.getElementById('similarIncidentsTableBody');

  // Card 2: Suggested Fix
  const confidencePctDisplay = document.getElementById('confidencePctDisplay');
  const diagnosticRootCauseText = document.getElementById('diagnosticRootCauseText');
  const suggestedFixCodeBlock = document.getElementById('suggestedFixCodeBlock');
  const btnCopyFixCode = document.getElementById('btnCopyFixCode');
  const copyBtnLabel = document.getElementById('copyBtnLabel');
  const evidenceReasonText = document.getElementById('evidenceReasonText');
  const evidenceScoreTag = document.getElementById('evidenceScoreTag');
  const confidenceMeterFill = document.getElementById('confidenceMeterFill');
  const btnVerifyWorked = document.getElementById('btnVerifyWorked');
  const btnVerifyFailed = document.getElementById('btnVerifyFailed');
  const verificationToast = document.getElementById('verificationToast');
  const verificationToastText = document.getElementById('verificationToastText');

  // Card 3: Risk Detection
  const riskMatrixPill = document.getElementById('riskMatrixPill');
  const riskStatusPanel = document.getElementById('riskStatusPanel');
  const riskPanelTitle = document.getElementById('riskPanelTitle');
  const riskPanelDesc = document.getElementById('riskPanelDesc');
  const riskSeverityBadge = document.getElementById('riskSeverityBadge');
  const predictionDetailsBox = document.getElementById('predictionDetailsBox');
  const preventiveActionText = document.getElementById('preventiveActionText');

  // KPI Elements
  const kpiTotalMemories = document.getElementById('kpiTotalMemories');
  const kpiRiskState = document.getElementById('kpiRiskState');
  const kpiRiskDot = document.getElementById('kpiRiskDot');

  // Team Memory Wall Elements
  const wallCountBadge = document.getElementById('wallCountBadge');
  const memoryCardsGrid = document.getElementById('memoryCardsGrid');
  const wallFilterPills = document.getElementById('wallFilterPills');
  const btnRefreshMemoryWall = document.getElementById('btnRefreshMemoryWall');

  // Ingest Modal Elements
  const btnOpenNewIncidentModal = document.getElementById('btnOpenNewIncidentModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const btnModalClose = document.getElementById('btnModalClose');
  const btnModalCancel = document.getElementById('btnModalCancel');
  const ingestModalForm = document.getElementById('ingestModalForm');
  const modalSpinner = document.getElementById('modalSpinner');

  // State
  let currentAnalysis = null;
  let activeWallFilter = 'all';

  // Initialize
  initHealthAndTelemetry();
  loadTeamMemoryWall();

  // Theme Toggle
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('theme-light');
  });

  // Clear Input
  issueInput.addEventListener('input', () => {
    btnClearInput.style.display = issueInput.value ? 'block' : 'none';
  });

  btnClearInput.addEventListener('click', () => {
    issueInput.value = '';
    btnClearInput.style.display = 'none';
    issueInput.focus();
  });

  // Telemetry Chip Presets
  telemetryChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-issue');
      if (query) {
        issueInput.value = query;
        btnClearInput.style.display = 'block';
        executeIncidentAnalysis(query);
      }
    });
  });

  // Submit Analysis Form
  analyzeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = issueInput.value.trim();
    if (query) {
      executeIncidentAnalysis(query);
    }
  });

  /**
   * Execute Incident Analysis Call (POST /analyze)
   */
  async function executeIncidentAnalysis(issue) {
    setLoadingState(true);
    hideVerificationToast();
    const startTime = performance.now();

    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue, limit: 3 }),
      });

      const result = await response.json();
      const latencyMs = Math.round(performance.now() - startTime);
      document.getElementById('latencyIndicator').textContent = `API Latency: ${latencyMs}ms`;

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Incident analysis query failed');
      }

      currentAnalysis = result.data;
      renderDevOpsDashboard(result.data);
    } catch (err) {
      console.error('Incident Analysis Error:', err);
      alert(`Incident Analysis Failed: ${err.message}`);
    } finally {
      setLoadingState(false);
    }
  }

  /**
   * Render DevOps Dashboard Cards and Verification Proof Chips
   */
  function renderDevOpsDashboard(data) {
    standbyState.style.display = 'none';
    devopsGrid.style.display = 'grid';
    techIntelligenceBar.style.display = 'grid';

    // -------------------------------------------------------------
    // DUAL TECHNOLOGY PROOF CHIPS
    // -------------------------------------------------------------

    // 1. Hindsight Memory Proof Chip
    if (data.memory_proof) {
      const isLive = data.memory_proof.mode === 'hindsight';
      hindsightModeBadge.textContent = isLive ? 'HINDSIGHT LIVE' : 'LOCAL FALLBACK';
      hindsightModeBadge.className = `chip-badge ${isLive ? 'live' : 'fallback'}`;

      proofLabel.textContent = data.memory_proof.label || 'Vectorize Hindsight (default-bank)';
      proofRecallStatus.textContent = `Recall: ${data.memory_proof.recall_status || 'ok'}`;
      proofReflectStatus.textContent = `Reflect: ${data.memory_proof.reflection_status || 'ok'}`;
      proofEvidenceCount.textContent = `Evidence: ${data.memory_proof.evidence_count} match(es)`;

      // Global status indicator in header
      const statusText = document.querySelector('.engine-status-text');
      const statusDot = document.querySelector('.status-indicator-dot');
      if (statusText) {
        if (isLive) {
          statusText.innerHTML = `Memory Engine: <strong>HINDSIGHT (LIVE)</strong>`;
          if (statusDot) statusDot.className = 'status-indicator-dot online';
        } else {
          statusText.innerHTML = `Memory Engine: <strong>LOCAL FALLBACK</strong> (Simulated)`;
          if (statusDot) statusDot.className = 'status-indicator-dot simulated';
        }
      }
    }

    // 2. CascadeFlow Runtime Intelligence Chip
    if (data.runtime_intelligence) {
      const rt = data.runtime_intelligence;
      const isLiveCascade = rt.mode === 'live';
      cascadeModeBadge.textContent = rt.mode.toUpperCase();
      cascadeModeBadge.className = `chip-badge ${isLiveCascade ? 'live' : 'simulated'}`;

      cascadeModelUsed.textContent = `Model: ${rt.model_used || 'simulated-router'}`;
      cascadeSavings.textContent = isLiveCascade ? `Savings: ${rt.savings_percentage}% cost` : `Savings: N/A (Simulated)`;
      cascadeLatency.textContent = isLiveCascade ? `Latency: ${rt.latency_ms}ms` : `Latency: <1ms (Local)`;
      cascadeStrategy.textContent = `Strategy: ${rt.routing_strategy}${rt.cascaded ? ' (Cascaded)' : ''}`;


      // Status Bar footer update
      const cascadeCell = document.getElementById('cascadeflowStatusCell');
      if (cascadeCell) {
        if (isLiveCascade) {
          cascadeCell.textContent = `CascadeFlow: ${rt.model_used} (${rt.savings_percentage}% saved)`;
          cascadeCell.style.color = '#34d399';
        } else {
          cascadeCell.textContent = `CascadeFlow: ${rt.mode} (${rt.routing_strategy})`;
        }
      }
    }

    // -------------------------------------------------------------
    // CARD 1: Incident Insights
    // -------------------------------------------------------------
    const freq = data.frequency_count || (data.similar_issues ? data.similar_issues.length : 0);
    frequencyCountDisplay.textContent = freq;

    const similarList = data.similar_issues || [];
    statMatchedCount.textContent = data.total_matches || similarList.length;

    const maxRelScore = similarList.length > 0
      ? Math.round((similarList[0].relevance_score || 0.85) * 100)
      : 88;
    maxRelevanceDisplay.textContent = `${maxRelScore}%`;
    statSimilarityPct.textContent = `${maxRelScore}%`;

    const totalVerified = similarList.reduce((acc, curr) => acc + (curr.times_worked || 0), 0);
    statVerifiedCount.textContent = totalVerified;

    renderIncidentTable(similarList);

    // -------------------------------------------------------------
    // CARD 2: Suggested Fix
    // -------------------------------------------------------------
    const confPct = Math.round((data.confidence_score || 0.85) * 100);
    confidencePctDisplay.textContent = `${confPct}%`;
    confidenceMeterFill.style.width = `${confPct}%`;

    const primaryCause = (similarList.length > 0 && similarList[0].root_cause)
      ? similarList[0].root_cause
      : 'Identified root cause pattern from historical memory bank.';
    diagnosticRootCauseText.textContent = primaryCause;

    suggestedFixCodeBlock.textContent = data.best_fix || 'No resolution script found.';
    evidenceReasonText.textContent = data.reason || 'Calculated based on verified success telemetry.';

    if (data.recommendation && data.recommendation.success_rate) {
      evidenceScoreTag.textContent = `${data.recommendation.success_rate} Historical Success`;
    }

    // -------------------------------------------------------------
    // CARD 3: Risk Detection
    // -------------------------------------------------------------
    const isRecurring = Boolean(data.is_recurring);
    const riskAssessment = data.risk_assessment || (isRecurring ? 'High risk of recurrence' : 'Low to Moderate risk of recurrence');
    const preventiveAction = data.preventive_action || 'Standard synthetic monitoring and alerting recommended.';

    if (isRecurring) {
      riskMatrixPill.textContent = 'HIGH RISK ALERT';
      riskMatrixPill.style.color = '#fb7185';
      riskMatrixPill.style.backgroundColor = 'rgba(244, 63, 94, 0.15)';

      riskStatusPanel.className = 'risk-status-panel danger';
      riskPanelTitle.textContent = `Recurring Pattern Detected (${data.frequency_count} Occurrences)`;
      riskPanelDesc.textContent = `This failure pattern has occurred 3 or more times across historical telemetry. High probability of recurring system downtime without architectural remediation.`;

      riskSeverityBadge.className = 'risk-severity-badge high';
      riskSeverityBadge.textContent = 'HIGH RISK';
      predictionDetailsBox.textContent = `${riskAssessment}. Failure pattern observed across multiple production incidents.`;

      kpiRiskState.textContent = 'ELEVATED';
      kpiRiskState.style.color = '#f43f5e';
      kpiRiskDot.className = 'kpi-dot dot-red';
    } else {
      riskMatrixPill.textContent = 'NOMINAL';
      riskMatrixPill.style.color = '#34d399';
      riskMatrixPill.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';

      riskStatusPanel.className = 'risk-status-panel nominal';
      riskPanelTitle.textContent = `Isolated / Infrequent Pattern (${data.frequency_count || 1} match)`;
      riskPanelDesc.textContent = `Occurrence volume is below the recurring threshold (< 3 occurrences). Standard operational stability.`;

      riskSeverityBadge.className = 'risk-severity-badge low';
      riskSeverityBadge.textContent = 'LOW RISK';
      predictionDetailsBox.textContent = `${riskAssessment}.`;

      kpiRiskState.textContent = 'STABLE';
      kpiRiskState.style.color = '#10b981';
      kpiRiskDot.className = 'kpi-dot dot-green';
    }

    preventiveActionText.textContent = preventiveAction;
  }

  /**
   * Render Incident Table (Card 1)
   */
  function renderIncidentTable(incidents) {
    similarIncidentsTableBody.innerHTML = '';

    if (!incidents || incidents.length === 0) {
      similarIncidentsTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; padding: 14px; color: var(--text-tertiary);">
            No matching historical incidents found in Hindsight memory.
          </td>
        </tr>
      `;
      return;
    }

    incidents.forEach((inc) => {
      const tr = document.createElement('tr');
      const pct = Math.round((inc.relevance_score || 0.8) * 100);
      const workedInfo = inc.times_worked ? ` (${inc.times_worked}x verified)` : '';

      tr.innerHTML = `
        <td><span class="match-pct-badge">${pct}%</span></td>
        <td style="font-weight: 600; color: var(--text-primary); cursor: pointer;" title="Click to analyze" class="clickable-incident">${escapeHtml(inc.issue || 'Incident')}</td>
        <td>${escapeHtml(inc.root_cause || 'N/A')}</td>
        <td style="color: var(--emerald-primary);">✓ ${escapeHtml(inc.outcome || 'Resolved')}${workedInfo}</td>
      `;

      const titleCell = tr.querySelector('.clickable-incident');
      if (titleCell) {
        titleCell.addEventListener('click', () => {
          issueInput.value = inc.issue;
          btnClearInput.style.display = 'block';
          executeIncidentAnalysis(inc.issue);
        });
      }

      similarIncidentsTableBody.appendChild(tr);
    });
  }

  /**
   * Load and Render Team Memory Wall (GET /store/memory)
   */
  async function loadTeamMemoryWall(highlightQueryOrId = null, filter = activeWallFilter) {
    try {
      let url = '/store/memory';
      const params = new URLSearchParams();

      if (filter && filter !== 'all') {
        if (filter === 'worked' || filter === 'failed') {
          params.append('status', filter);
        } else {
          params.append('tag', filter);
        }
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch memory wall');
      }

      const memories = result.data.memories || [];
      const stats = result.data.stats || {};

      // Update Memory Count Badges
      wallCountBadge.textContent = `${result.data.total || memories.length} Retained Memories`;
      if (kpiTotalMemories) {
        kpiTotalMemories.textContent = (result.data.total || memories.length).toLocaleString();
      }

      renderMemoryWallCards(memories, highlightQueryOrId);
    } catch (err) {
      console.error('Team Memory Wall Error:', err);
      memoryCardsGrid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 24px; text-align: center; color: var(--text-secondary);">
          Unable to load memories from store: ${escapeHtml(err.message)}
        </div>
      `;
    }
  }

  /**
   * Render Memory Wall Cards
   */
  function renderMemoryWallCards(memories, highlightQueryOrId) {
    memoryCardsGrid.innerHTML = '';

    if (!memories || memories.length === 0) {
      memoryCardsGrid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 30px; text-align: center; color: var(--text-tertiary); background: var(--bg-panel-elevated); border-radius: var(--radius-sm);">
          No memories found matching the current filter.
        </div>
      `;
      return;
    }

    let targetHighlightedCard = null;

    memories.forEach((mem) => {
      const card = document.createElement('div');
      const isStatusWorked = mem.status === 'worked' || (mem.worked_count > 0 && mem.failed_count === 0);
      const isStatusFailed = mem.status === 'failed' || mem.failed_count > 0;
      const statusClass = isStatusWorked ? 'worked' : isStatusFailed ? 'failed' : 'pending';
      const statusLabel = isStatusWorked ? '✓ Worked' : isStatusFailed ? '✗ Failed' : '⏳ Pending';

      card.className = 'memory-card';
      card.setAttribute('data-id', mem.id);

      // Highlight match condition
      const isMatch = highlightQueryOrId && (
        mem.id === highlightQueryOrId ||
        (mem.issue && mem.issue.toLowerCase().trim() === highlightQueryOrId.toLowerCase().trim()) ||
        (mem.fix && mem.fix.toLowerCase().trim() === highlightQueryOrId.toLowerCase().trim())
      );

      if (isMatch) {
        card.classList.add('memory-card-highlighted');
        targetHighlightedCard = card;
      }

      const tagsHtml = (mem.tags || []).slice(0, 4).map((t) =>
        `<span class="memory-tag-chip">#${escapeHtml(t)}</span>`
      ).join('');

      card.innerHTML = `
        <div class="memory-card-top">
          <h4 class="memory-card-title">${escapeHtml(mem.issue || 'Incident')}</h4>
          <span class="memory-status-badge ${statusClass}">${statusLabel}</span>
        </div>

        <div class="memory-detail-row">
          <span class="memory-detail-label">ROOT CAUSE</span>
          <p class="memory-detail-content">${escapeHtml(mem.root_cause || 'Identified via telemetry')}</p>
        </div>

        <div class="memory-detail-row">
          <span class="memory-detail-label text-emerald">VERIFIED FIX</span>
          <div class="memory-fix-snippet"><code>${escapeHtml(mem.fix || 'Applied resolution')}</code></div>
        </div>

        <div class="memory-detail-row">
          <span class="memory-detail-label">OBSERVED OUTCOME</span>
          <p class="memory-detail-content" style="color: var(--text-primary); font-size: 11.5px;">${escapeHtml(mem.outcome || 'Resolved')}</p>
        </div>

        <div class="memory-card-footer">
          <div class="memory-tags-list">
            ${tagsHtml}
          </div>
          <div class="memory-meta-right">
            <span class="memory-count-pill worked">${mem.worked_count || 0}x ✓</span>
            <span class="memory-count-pill failed">${mem.failed_count || 0}x ✗</span>
            <span class="memory-time">${formatTimeAgo(mem.createdAt)}</span>
          </div>
        </div>
      `;

      // Allow clicking memory card to load into console
      card.addEventListener('click', () => {
        issueInput.value = mem.issue;
        btnClearInput.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        executeIncidentAnalysis(mem.issue);
      });

      memoryCardsGrid.appendChild(card);
    });

    // Smoothly scroll to the highlighted card to showcase the learning moment
    if (targetHighlightedCard) {
      setTimeout(() => {
        targetHighlightedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }

  // Filter Pills Event Listeners
  if (wallFilterPills) {
    const pills = wallFilterPills.querySelectorAll('.w-filter-pill');
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        activeWallFilter = pill.getAttribute('data-filter') || 'all';
        loadTeamMemoryWall(null, activeWallFilter);
      });
    });
  }

  // Refresh Memory Wall Button
  if (btnRefreshMemoryWall) {
    btnRefreshMemoryWall.addEventListener('click', () => {
      btnRefreshMemoryWall.disabled = true;
      loadTeamMemoryWall().finally(() => {
        setTimeout(() => {
          btnRefreshMemoryWall.disabled = false;
        }, 500);
      });
    });
  }

  /**
   * Operator Verification / Feedback Submission with Memory Reinforcement
   */
  async function submitOperatorFeedback(workedStatus) {
    if (!currentAnalysis || !currentAnalysis.best_fix) {
      alert('Please analyze an incident before submitting verification.');
      return;
    }

    const isSuccess = workedStatus === 'worked';
    const activeIssue = currentAnalysis.query_issue || issueInput.value.trim();

    try {
      const payload = {
        issue: activeIssue,
        fix: currentAnalysis.best_fix,
        status: workedStatus,
        actual_outcome: isSuccess ? 'Verified in production by SRE operator' : 'Failed in production',
        user: 'sre_oncall',
      };

      const response = await fetch('/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Feedback sync failed');
      }

      showVerificationToast(
        isSuccess
          ? 'Memory Reinforced: Fix verified as SUCCESSFUL in Hindsight. Wall updated.'
          : 'Memory Adjusted: Fix marked as INEFFECTIVE. Wall updated.'
      );

      // Refresh Team Memory Wall and highlight the newly updated memory (the learning moment)
      await loadTeamMemoryWall(activeIssue);
    } catch (err) {
      console.error('Feedback Error:', err);
      alert(`Failed to record verification: ${err.message}`);
    }
  }

  btnVerifyWorked.addEventListener('click', () => submitOperatorFeedback('worked'));
  btnVerifyFailed.addEventListener('click', () => submitOperatorFeedback('failed'));

  /**
   * Copy Fix Code Block
   */
  btnCopyFixCode.addEventListener('click', () => {
    const code = suggestedFixCodeBlock.textContent;
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        copyBtnLabel.textContent = 'Copied!';
        setTimeout(() => {
          copyBtnLabel.textContent = 'Copy Action';
        }, 2000);
      });
    }
  });

  /**
   * Ingest Modal Actions
   */
  btnOpenNewIncidentModal.addEventListener('click', () => {
    modalBackdrop.style.display = 'flex';
  });

  const closeModal = () => {
    modalBackdrop.style.display = 'none';
    ingestModalForm.reset();
  };

  btnModalClose.addEventListener('click', closeModal);
  btnModalCancel.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  ingestModalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    modalSpinner.style.display = 'inline-block';

    const payload = {
      issue: document.getElementById('modalInputIssue').value.trim(),
      root_cause: document.getElementById('modalInputRootCause').value.trim(),
      fix: document.getElementById('modalInputFix').value.trim(),
      outcome: document.getElementById('modalInputOutcome').value.trim(),
      tags: document.getElementById('modalInputTags').value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const response = await fetch('/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Ingest memory failed');
      }

      closeModal();
      showVerificationToast('Incident postmortem successfully retained in Hindsight.');

      // Refresh memory wall highlighting new incident
      await loadTeamMemoryWall(payload.issue);

      issueInput.value = payload.issue;
      btnClearInput.style.display = 'block';
      executeIncidentAnalysis(payload.issue);
    } catch (err) {
      console.error('Ingest Error:', err);
      alert(`Ingest error: ${err.message}`);
    } finally {
      modalSpinner.style.display = 'none';
    }
  });

  /**
   * Initialization & Helpers
   */
  async function initHealthAndTelemetry() {
    try {
      const res = await fetch('/health');
      const data = await res.json();
      if (data.success) {
        const ind = document.getElementById('engineStatusIndicator');
        if (ind) {
          ind.querySelector('.status-indicator-dot').className = 'status-indicator-dot online';
        }
      }
    } catch (e) {
      console.warn('Backend offline');
    }
  }

  function setLoadingState(isLoading) {
    btnAnalyze.disabled = isLoading;
    analyzeSpinner.style.display = isLoading ? 'inline-block' : 'none';
    btnAnalyze.querySelector('.btn-text').textContent = isLoading ? 'Analyzing...' : 'Execute Analysis';
  }

  function showVerificationToast(msg) {
    verificationToastText.textContent = msg;
    verificationToast.style.display = 'flex';
    setTimeout(() => {
      verificationToast.style.display = 'none';
    }, 5000);
  }

  function hideVerificationToast() {
    verificationToast.style.display = 'none';
  }

  function formatTimeAgo(isoString) {
    if (!isoString) return 'Recent';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  }

  function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }
});

