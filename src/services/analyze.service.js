import { hindsightService } from './hindsight.service.js';
import { storeService } from './store.service.js';
import { feedbackService } from './feedback.service.js';

class AnalyzeService {
  /**
   * Analyze an issue by searching Hindsight memory for similar issues,
   * ranking past incidents by success rate, detecting recurring patterns (3+ occurrences),
   * applying prediction logic for risk of recurrence and preventive actions,
   * and returning the best fix with confidence score, pattern detection, and evidence reason.
   *
   * @param {Object} params
   * @param {string} params.issue - User issue description
   * @param {string} [params.bankId] - Target Hindsight memory bank ID
   * @param {number} [params.limit=3] - Number of top matches to return
   * @param {string[]} [params.tags] - Optional tag filters
   */
  async analyzeIssue({ issue, bankId, limit = 3, tags = [] }) {
    // 1. Query Hindsight memory bank for semantic matches
    const hindsightRecall = await hindsightService.recall({
      bankId,
      query: issue,
      tags: tags.length > 0 ? tags : undefined,
    });

    // 2. Fetch all stored incidents and all recorded feedback
    const allStoredIncidents = await storeService.getAllItems();
    const allFeedback = await feedbackService.getAllFeedback();

    // 3. Rank incidents by similarity and success rate
    const rankedIncidents = this._rankIncidents(issue, allStoredIncidents, allFeedback);

    // 4. Pattern Detection: Identify if similar issues occur 3+ times
    const patternAnalysis = this._detectRecurringPattern(rankedIncidents);

    // 5. Prediction Logic: Determine risk of recurrence and suggest rule-based preventive actions
    const predictionAnalysis = this._predictRecurrenceAndAction(
      issue,
      patternAnalysis,
      rankedIncidents
    );

    // 6. Take top N similar issues (default top 3)
    const topMatches = rankedIncidents.slice(0, limit);

    // 7. Aggregate and rank candidate fixes based on success rate and times worked
    const fixAnalysis = this._determineBestFix(
      issue,
      topMatches,
      rankedIncidents,
      allFeedback,
      patternAnalysis
    );

    // 8. Format top similar issues
    const similarIssues = topMatches.map((item) => ({
      id: item.id,
      issue: item.issue,
      root_cause: item.root_cause,
      fix: item.fix,
      outcome: item.outcome,
      relevance_score: item.similarity_score,
      success_rate: item.success_rate,
      times_worked: item.times_worked,
      times_failed: item.times_failed,
      tags: item.tags || [],
      storedAt: item.createdAt,
    }));

    const pastFixes = Array.from(
      new Set(topMatches.map((item) => item.fix).filter(Boolean))
    );

    const outcomes = Array.from(
      new Set(topMatches.map((item) => item.outcome).filter(Boolean))
    );

    return {
      query_issue: issue,
      pattern_alert: patternAnalysis.is_recurring
        ? 'Recurring issue detected'
        : null,
      frequency_count: patternAnalysis.frequency_count,
      is_recurring: patternAnalysis.is_recurring,
      risk_assessment: predictionAnalysis.risk_assessment,
      preventive_action: predictionAnalysis.preventive_action,
      prediction: {
        risk_level: predictionAnalysis.risk_assessment,
        preventive_action: predictionAnalysis.preventive_action,
        is_high_risk: patternAnalysis.is_recurring,
        rule_applied: predictionAnalysis.rule_applied,
      },
      pattern: {
        status: patternAnalysis.is_recurring
          ? 'Recurring issue detected'
          : 'No recurring pattern detected',
        is_recurring: patternAnalysis.is_recurring,
        frequency_count: patternAnalysis.frequency_count,
        threshold: 3,
      },
      best_fix: fixAnalysis.best_fix,
      confidence_score: fixAnalysis.confidence_score,
      reason: fixAnalysis.reason,
      recommendation: {
        fix: fixAnalysis.best_fix,
        confidence_score: fixAnalysis.confidence_score,
        success_rate: `${(fixAnalysis.success_rate * 100).toFixed(0)}%`,
        times_worked: fixAnalysis.times_worked,
        times_failed: fixAnalysis.times_failed,
        pattern_alert: patternAnalysis.is_recurring
          ? 'Recurring issue detected'
          : null,
        risk_assessment: predictionAnalysis.risk_assessment,
        preventive_action: predictionAnalysis.preventive_action,
        frequency_count: patternAnalysis.frequency_count,
        reason: fixAnalysis.reason,
      },
      ranked_fixes: fixAnalysis.ranked_fixes,
      total_matches: similarIssues.length,
      similar_issues: similarIssues,
      past_fixes: pastFixes,
      outcomes: outcomes,
      hindsight_search: hindsightRecall,
    };
  }

  /**
   * Pattern Detection: Check if similar incidents occur 3 or more times
   * @param {Array<Object>} rankedIncidents
   */
  _detectRecurringPattern(rankedIncidents) {
    if (!rankedIncidents || rankedIncidents.length === 0) {
      return { is_recurring: false, frequency_count: 0 };
    }

    // Count incidents with significant relevance (similarity_score >= 0.35)
    const similarIncidents = rankedIncidents.filter(
      (inc) => (inc.similarity_score || 0) >= 0.35
    );

    const frequencyCount =
      similarIncidents.length > 0 ? similarIncidents.length : rankedIncidents.length;
    const isRecurring = frequencyCount >= 3;

    return {
      is_recurring: isRecurring,
      frequency_count: frequencyCount,
    };
  }

  /**
   * Rule-Based Prediction Logic:
   * If a pattern exists (3+ occurrences), return "High risk of recurrence" and suggest preventive actions.
   * @param {string} query
   * @param {{ is_recurring: boolean, frequency_count: number }} patternAnalysis
   * @param {Array<Object>} rankedIncidents
   */
  _predictRecurrenceAndAction(query, patternAnalysis, rankedIncidents) {
    if (!patternAnalysis.is_recurring) {
      return {
        risk_assessment: 'Low to Moderate risk of recurrence',
        preventive_action: 'Standard monitoring and automated alerting recommended.',
        rule_applied: 'Baseline incident volume (< 3 occurrences)',
      };
    }

    // Aggregate keywords from query and matching incidents
    const combinedContext = [
      query,
      ...rankedIncidents.slice(0, 3).map((inc) => `${inc.issue} ${inc.root_cause} ${(inc.tags || []).join(' ')}`),
    ]
      .join(' ')
      .toLowerCase();

    // Rule-based domain matcher
    if (
      combinedContext.includes('database') ||
      combinedContext.includes('pool') ||
      combinedContext.includes('connection') ||
      combinedContext.includes('postgres') ||
      combinedContext.includes('mysql')
    ) {
      return {
        risk_assessment: 'High risk of recurrence',
        preventive_action:
          'Implement database connection pool autoscaling, configure client-side query timeouts (5s), and add read replicas to distribute peak connection loads.',
        rule_applied: 'Database connection resource exhaustion rule',
      };
    }

    if (
      combinedContext.includes('memory') ||
      combinedContext.includes('leak') ||
      combinedContext.includes('oom') ||
      combinedContext.includes('heap')
    ) {
      return {
        risk_assessment: 'High risk of recurrence',
        preventive_action:
          'Enforce strict maximum cache sizes with TTL expiration, configure heap memory alerts at 75% threshold, and schedule automated memory leak regression tests.',
        rule_applied: 'Memory leak and heap exhaustion rule',
      };
    }

    if (
      combinedContext.includes('timeout') ||
      combinedContext.includes('latency') ||
      combinedContext.includes('queue') ||
      combinedContext.includes('worker') ||
      combinedContext.includes('gateway')
    ) {
      return {
        risk_assessment: 'High risk of recurrence',
        preventive_action:
          'Decouple synchronous workflows into asynchronous background workers (e.g. BullMQ/Redis) and configure circuit breakers on external service calls.',
        rule_applied: 'Synchronous blocking & latency timeout rule',
      };
    }

    if (
      combinedContext.includes('index') ||
      combinedContext.includes('query') ||
      combinedContext.includes('cpu') ||
      combinedContext.includes('slow')
    ) {
      return {
        risk_assessment: 'High risk of recurrence',
        preventive_action:
          'Add continuous slow query profiling (e.g. pg_stat_statements), create missing composite indexes, and enforce query complexity budget limits.',
        rule_applied: 'Unindexed query & CPU spike rule',
      };
    }

    // Default preventive action for recurring patterns
    return {
      risk_assessment: 'High risk of recurrence',
      preventive_action:
        'Implement proactive synthetic health probes, add real-time threshold alerts, and conduct architectural root-cause remediation in the CI/CD pipeline.',
      rule_applied: 'General recurring incident pattern rule',
    };
  }

  /**
   * Determine the best fix based on success rate, times worked, similarity, and pattern detection
   */
  _determineBestFix(query, topMatches, allRankedIncidents, allFeedback, patternAnalysis) {
    // If no incidents found, return default fallback
    if (!allRankedIncidents || allRankedIncidents.length === 0) {
      return {
        best_fix: 'No historical fixes available for this issue',
        confidence_score: 0.1,
        success_rate: 0,
        times_worked: 0,
        times_failed: 0,
        reason: 'No previous incident records matched the query issue.',
        ranked_fixes: [],
      };
    }

    // Pool candidate fixes from matched incidents
    const pool = topMatches.length > 0 ? topMatches : allRankedIncidents;
    const fixMap = new Map();

    pool.forEach((item) => {
      if (!item.fix) return;
      const key = item.fix.trim();
      if (!fixMap.has(key)) {
        fixMap.set(key, {
          fix: key,
          incidents: [],
          similarity_scores: [],
          outcomes: new Set(),
          root_causes: new Set(),
          times_worked: 0,
          times_failed: 0,
        });
      }
      const entry = fixMap.get(key);
      entry.incidents.push(item);
      entry.similarity_scores.push(item.similarity_score || 0.5);
      if (item.outcome) entry.outcomes.add(item.outcome);
      if (item.root_cause) entry.root_causes.add(item.root_cause);
      entry.times_worked += item.times_worked || 0;
      entry.times_failed += item.times_failed || 0;
    });

    // Also factor in global feedback records matching the fix
    allFeedback.forEach((fb) => {
      if (!fb.fix) return;
      const key = fb.fix.trim();
      if (fixMap.has(key)) {
        const entry = fixMap.get(key);
        if (!fb.incident_id) {
          if (fb.worked || fb.status === 'worked') entry.times_worked += 1;
          if (fb.status === 'failed' || fb.worked === false) entry.times_failed += 1;
        }
      }
    });

    // Score and rank each fix
    const rankedFixes = Array.from(fixMap.values()).map((entry) => {
      const avgRelevance =
        entry.similarity_scores.reduce((a, b) => a + b, 0) /
        entry.similarity_scores.length;

      const totalAttempts = entry.times_worked + entry.times_failed;
      const successRate =
        totalAttempts > 0 ? entry.times_worked / totalAttempts : 1.0;

      const volumeBoost = Math.min(0.25, entry.times_worked * 0.05);
      const failurePenalty = entry.times_failed * 0.3;

      const compositeScore = +(
        avgRelevance * 0.4 +
        successRate * 0.35 +
        volumeBoost -
        failurePenalty
      ).toFixed(4);

      const confidence = +(
        Math.min(
          0.99,
          Math.max(
            0.15,
            avgRelevance * 0.45 +
              successRate * 0.35 +
              Math.min(0.15, entry.times_worked * 0.04) -
              entry.times_failed * 0.25
          )
        )
      ).toFixed(2);

      return {
        fix: entry.fix,
        confidence_score: confidence,
        composite_score: compositeScore,
        success_rate: successRate,
        times_worked: entry.times_worked,
        times_failed: entry.times_failed,
        average_relevance: +avgRelevance.toFixed(2),
        outcomes: Array.from(entry.outcomes),
        root_causes: Array.from(entry.root_causes),
      };
    });

    // Sort fixes by composite score descending
    rankedFixes.sort((a, b) => b.composite_score - a.composite_score);

    const best = rankedFixes[0];

    // Generate evidence-based explanation
    const bestOutcome = best.outcomes[0] || 'resolved the issue';
    const successPercent = `${(best.success_rate * 100).toFixed(0)}%`;
    const relevancePercent = `${(best.average_relevance * 100).toFixed(0)}%`;

    let reason = `Recommended because it has a ${successPercent} historical success rate`;
    if (best.times_worked > 0) {
      reason += ` (verified in ${best.times_worked} past incident(s))`;
    }
    reason += ` with ${relevancePercent} similarity to the reported issue.`;
    if (bestOutcome) {
      reason += ` Past verified outcome: "${bestOutcome}".`;
    }

    if (patternAnalysis && patternAnalysis.is_recurring) {
      reason += ` (Note: Recurring issue detected - occurred ${patternAnalysis.frequency_count} times; high risk of recurrence).`;
    }

    if (rankedFixes.length > 1 && rankedFixes[1].times_failed > 0) {
      reason += ` Alternative fix "${rankedFixes[1].fix}" was downranked due to ${rankedFixes[1].times_failed} past failure(s).`;
    }

    return {
      best_fix: best.fix,
      confidence_score: best.confidence_score,
      success_rate: best.success_rate,
      times_worked: best.times_worked,
      times_failed: best.times_failed,
      reason,
      ranked_fixes: rankedFixes,
    };
  }

  /**
   * Rank incidents taking into account both lexical similarity and historical feedback / success rate
   */
  _rankIncidents(query, incidents, allFeedback) {
    if (!incidents || incidents.length === 0) return [];

    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for', 'of', 'with', 'from', 'by', 'as', 'it', 'this', 'that'
    ]);

    const tokenize = (text = '') =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1 && !stopWords.has(w));

    const queryTokens = new Set(tokenize(query));

    const scored = incidents.map((inc) => {
      const issueTokens = tokenize(inc.issue || '');
      const rootCauseTokens = tokenize(inc.root_cause || '');
      const tagTokens = tokenize((inc.tags || []).join(' '));

      let matchCount = 0;
      queryTokens.forEach((token) => {
        if (issueTokens.includes(token)) matchCount += 3;
        else if (rootCauseTokens.includes(token)) matchCount += 2;
        else if (tagTokens.includes(token)) matchCount += 1.5;
        else {
          const hasSubstring = (inc.issue || '').toLowerCase().includes(token);
          if (hasSubstring) matchCount += 1;
        }
      });

      const maxPossibleScore = queryTokens.size * 3;
      const rawScore = maxPossibleScore > 0 ? matchCount / maxPossibleScore : 0;
      const similarityScore = +(Math.min(1.0, Math.max(0.1, rawScore))).toFixed(2);

      const timesWorked = inc.success_count || (inc.last_feedback_status === 'worked' ? 1 : 0);
      const timesFailed = inc.failure_count || (inc.last_feedback_status === 'failed' ? 1 : 0);
      const totalFeedback = timesWorked + timesFailed;
      const successRate = totalFeedback > 0 ? timesWorked / totalFeedback : 1.0;

      const rankScore = +(
        similarityScore * 0.55 +
        successRate * 0.35 +
        Math.min(0.15, timesWorked * 0.05) -
        timesFailed * 0.25
      ).toFixed(4);

      return {
        ...inc,
        similarity_score: matchCount > 0 ? similarityScore : 0.2,
        rank_score: rankScore,
        success_rate: successRate,
        times_worked: timesWorked,
        times_failed: timesFailed,
      };
    });

    return scored.sort((a, b) => b.rank_score - a.rank_score);
  }
}

export const analyzeService = new AnalyzeService();
