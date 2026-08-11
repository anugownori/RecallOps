/**
 * RecallOps SRE Console - Enterprise Client Controller
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
  const kpiRiskState = document.getElementById('kpiRiskState');
  const kpiRiskDot = document.getElementById('kpiRiskDot');

  // Ingest Modal Elements
  const btnOpenNewIncidentModal = document.getElementById('btnOpenNewIncidentModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const btnModalClose = document.getElementById('btnModalClose');
  const btnModalCancel = document.getElementById('btnModalCancel');
  const ingestModalForm = document.getElementById('ingestModalForm');
  const modalSpinner = document.getElementById('modalSpinner');

  // State
  let currentAnalysis = null;

  // Initialize
  initHealthAndTelemetry();

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
   * Render DevOps Dashboard Cards
   */
  function renderDevOpsDashboard(data) {
    standbyState.style.display = 'none';
    devopsGrid.style.display = 'grid';

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
        <td style="font-weight: 600; color: var(--text-primary);">${escapeHtml(inc.issue || 'Incident')}</td>
        <td>${escapeHtml(inc.root_cause || 'N/A')}</td>
        <td style="color: var(--emerald-primary);">✓ ${escapeHtml(inc.outcome || 'Resolved')}${workedInfo}</td>
      `;
      similarIncidentsTableBody.appendChild(tr);
    });
  }

  /**
   * Operator Verification / Feedback Submission
   */
  async function submitOperatorFeedback(workedStatus) {
    if (!currentAnalysis || !currentAnalysis.best_fix) {
      alert('Please analyze an incident before submitting verification.');
      return;
    }

    const isSuccess = workedStatus === 'worked';

    try {
      const payload = {
        issue: currentAnalysis.query_issue,
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
          ? 'Memory Reinforced: Fix verified as SUCCESSFUL in Hindsight.'
          : 'Memory Adjusted: Fix marked as INEFFECTIVE. Telemetry updated.'
      );
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
        document.getElementById('engineStatusIndicator').querySelector('.status-indicator-dot').className = 'status-indicator-dot online';
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

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
