# -*- coding: utf-8 -*-
import re

with open('pages/NetZeroV2.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports to include Database, Globe, Percent if missing
if 'Database' not in code:
    code = code.replace(
        'TrendingDown',
        'TrendingDown, Database, Globe, Percent'
    )

# 2. Extract Market Status Overview Cards: from '{/* MARKET STATUS OVERVIEW CARDS */}' to '{/* NAVIGATION TABS */}'
m_cards_match = re.search(r'(\{/\* MARKET STATUS OVERVIEW CARDS \*/\}.*?)(\{/\* NAVIGATION TABS \*/\})', code, re.DOTALL)
if not m_cards_match:
    raise Exception('Could not find Market Status Cards or Navigation Tabs')

market_cards_block = m_cards_match.group(1).strip()

# 3. Extract Tab 1 content: from line '<div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row' to end of tab 1 div
tab1_match = re.search(r'(\{activeTab === ['"]allocation['"].*?<div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">\s*)(<div className="p-4 border-b border-gray-100.*?)(\s*</div>\s*</div>\s*\)\}\s*\{/\* TAB 2: SCENARIO & COST COMPARISON \*/\})', code, re.DOTALL)
if not tab1_match:
    raise Exception('Could not match Tab 1 inner content')

tab1_inner = tab1_match.group(2).strip()

# 4. Extract Tab 2 (Comparison) content: from '{activeTab === "comparison" && (' to '{/* TAB 3: VERIFIER DECLARATION REPORT */}'
tab2_match = re.search(r'\{activeTab === ['"]comparison['"].*?<div className="space-y-6">(.*?)\s*</div>\s*\)\}\s*\{/\* TAB 3: VERIFIER DECLARATION REPORT \*/\}', code, re.DOTALL)
if not tab2_match:
    raise Exception('Could not match Tab 2 comparison content')

tab2_comparison_body = tab2_match.group(1).strip()

# 5. Extract everything after Tab 3 (Verifier): starts from '{/* CREATE NEW BATCH MODAL */}'
modal_part_match = re.search(r'(\{/\* CREATE NEW BATCH MODAL \*/\}.*)', code, re.DOTALL)
if not modal_part_match:
    raise Exception('Could not match New Batch Modal')

modal_part = modal_part_match.group(1)

# 6. Extract prefix: up to '{/* MARKET STATUS OVERVIEW CARDS */}'
prefix_match = re.search(r'(.*?)\{\/\* MARKET STATUS OVERVIEW CARDS \*\/\}', code, re.DOTALL)
if not prefix_match:
    raise Exception('Could not match prefix')

prefix = prefix_match.group(1).rstrip()

print('Successfully extracted all segments!')
