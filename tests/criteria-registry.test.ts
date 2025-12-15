import { describe, it, expect } from 'vitest';
import { 
  SERVICE_1_CRITERIA, 
  SERVICE_2_CRITERIA, 
  totalCount, 
  countByGroup 
} from '../shared/criteria-registry';

describe('Criteria Registry', () => {
  it('SERVICE_1_CRITERIA should have exactly 45 items', () => {
    expect(totalCount(SERVICE_1_CRITERIA)).toBe(45);
    expect(SERVICE_1_CRITERIA.length).toBe(45);
  });

  it('SERVICE_1_CRITERIA breakdown should match 12/4/9/12/8', () => {
    const breakdown = countByGroup(SERVICE_1_CRITERIA);
    
    expect(breakdown.fz152).toBe(12);
    expect(breakdown.fz149).toBe(4);
    expect(breakdown.cookies).toBe(9);
    expect(breakdown.technical).toBe(12);
    expect(breakdown.legal).toBe(8);
    
    const sum = breakdown.fz152 + breakdown.fz149 + breakdown.cookies + breakdown.technical + breakdown.legal;
    expect(sum).toBe(45);
  });

  it('SERVICE_2_CRITERIA should include all SERVICE_1 criteria plus additional document criteria', () => {
    expect(totalCount(SERVICE_2_CRITERIA)).toBeGreaterThan(45);
    
    // Should include all Service 1 criteria IDs
    const service1Ids = SERVICE_1_CRITERIA.map(c => c.id);
    const service2Ids = SERVICE_2_CRITERIA.map(c => c.id);
    
    for (const id of service1Ids) {
      expect(service2Ids).toContain(id);
    }
  });

  it('All criteria should have required fields', () => {
    for (const criteria of SERVICE_1_CRITERIA) {
      expect(criteria.id).toBeTruthy();
      expect(criteria.group).toBeTruthy();
      expect(criteria.title).toBeTruthy();
      expect(criteria.checkKind).toBeTruthy();
      expect(criteria.recommendation).toBeTruthy();
      expect(['critical', 'medium', 'low']).toContain(criteria.severity);
    }
  });
});
