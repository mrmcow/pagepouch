Perfect. Let’s lock this down into a **dedicated, detailed requirements document for the Graphs feature** — so it can stand alone as the single source of truth for Cursor or your devs. I’ll treat it like a PRD (product requirements doc) with structured detail.

---

# 📘 Product Requirements: Graphs Feature

## 1. Vision

Enable analysts to **transform their saved captures** (screenshots, HTML, text) into **interactive graphs of entities and relationships**, scoped only to what they have collected. The Graphs feature must be:

* **Automatic**: builds initial nodes/edges without setup.
* **Explainable**: every node/edge is tied to captured text (evidence).
* **Editable**: users can refine connections manually.
* **Actionable**: results can be explored, summarized, and exported.
* **Intuitive**: feels like “the graph forms naturally from the data,” not like manual diagramming.

---

## 2. User Stories

### Graph Creation

* As a user, I can **create a new graph from a folder or selected captures**, so I can analyze only what matters.
* As a user, I can **name and save a graph**, so I can return later.
* As a user, I can **rebuild a graph** if captures are updated.

### Graph Structure

* As a user, I want **entities auto-extracted** (domains, IPs, emails, handles, people, orgs, tags), so the graph is meaningful without heavy setup.
* As a user, I want **edges auto-generated** (co-occurrence, hyperlinks), so I see natural associations.
* As a user, I want to **see why a node or edge exists** (citations), so I trust the connections.

### Interaction

* As a user, I can **drag from one node to another** to create a manual edge, with a relationship type and optional note.
* As a user, I can **merge duplicate nodes** (e.g., “evil.com” and “[www.evil.com”](http://www.evil.com”)).
* As a user, I can **group nodes** (e.g., all domains belonging to an org).
* As a user, I can **pin or hide nodes** for clarity.
* As a user, I can **re-layout the graph** (force-directed, compact), so it stays readable.

### Evidence & Context

* As a user, when I click a node, I see:

  * The type (Domain, Person, etc.)
  * Evidence snippets from my captures (highlighted text).
  * The captures that mention it.
* As a user, when I click an edge, I see:

  * The relationship type.
  * Evidence supporting that link (captures/snippets).

### Output

* As a user, I can **export a graph** as PNG or PDF (with timestamp + legend), so I can include it in reports.
* As a user, I can **save my graph layout** and load it again later.

### Natural-Language Queries

* As a user, I can type a question like “Who’s talking about ALPHAFOX and how are they connected?”
* The system builds a **subgraph + summary** based on my scope.
* The answer panel shows:

  * Bullet insights with citations.
  * Graph visualization.
  * Evidence captures.

---

## 3. Functional Requirements

### Entity Extraction

* Extract from captured text:

  * **Regex rules**: domains, IPs, emails, handles (@user).
  * **NER-lite**: people and orgs.
* Normalize: lowercase, strip “[www.”](http://www.”), dedupe aliases.
* Store as `graph_nodes` with type and evidence count.

### Edge Generation

* **Mentions**: co-occurrence in same sentence/paragraph/capture.
* **Linked-to**: href relationships in HTML.
* **Affiliated-with**: manually added edges.
* Store edges with type, weight (frequency), and evidence references.

### Evidence

* Each node/edge links back to `graph_evidence`:

  * capture\_id
  * snippet text
  * offsets (start/end)
* Must show 3–10 representative snippets.

### Graph Data Model

**Graphs**

* id, user\_id, name, created\_at, updated\_at
* source\_folders\[], source\_capture\_ids\[]
* layout JSON (node positions)

**Graph Nodes**

* id, graph\_id, label, type(enum: domain, ip, email, handle, person, org, tag, custom)
* evidence\_count, note, merged\_into

**Graph Edges**

* id, graph\_id, source\_node\_id, target\_node\_id
* rel\_type(enum: mentions, linked\_to, affiliated\_with, custom)
* weight, note

**Graph Evidence**

* id, graph\_id, node\_id?, edge\_id?, capture\_id, snippet, offsets

---

## 4. Non-Functional Requirements

* **Performance**:

  * Build graph ≤ 5s for 100 captures.
  * Interactions < 120ms for graphs ≤ 300 nodes.
* **Mobile**:

  * Answer/evidence first, mini-graph as secondary.
  * Pan/zoom works with two-finger gestures.
* **Security**:

  * User-scoped graphs only.
  * Sanitized evidence.
* **Reliability**:

  * Layout auto-saved every 2s idle.
  * Graph export completes < 3s.

---

## 5. UX Requirements

### Layout

* **Top bar**: Graph name, scope, actions (Auto-layout, Export).
* **Left drawer**: entity types (chips) with counts; toggle visibility.
* **Center**: Cytoscape.js graph canvas.
* **Right panel**: context panel for selected node/edge.
* **Bottom bar (mobile)**: summary bullets + evidence list.

### Colors

* Person = Orange `#F59E0B`
* Org = Green `#10B981`
* Domain = Blue `#3B82F6`
* IP = Purple `#8B5CF6`
* Email/Handle = Teal `#14B8A6`
* Tag = Slate `#64748B`

### Edge Styles

* Mentions = thin solid line
* Linked-to = medium solid line
* Affiliated-with = dashed line
* Custom = dashed-dot

---

## 6. Exports

* PNG/SVG graph export (with legend + timestamp).
* PDF report:

  * Summary bullets
  * Graph snapshot
  * Evidence list

---

## 7. Backlog & Estimates

**Backend**

* Schema (graphs/nodes/edges/evidence) – 0.5d
* Extraction job (regex + NER-lite) – 2d
* Edge builder (co-occurrence, href) – 2d
* Evidence storage – 1d
* Export service (PNG/PDF) – 1.5d

**Frontend**

* Graph UI shell (3-pane layout) – 1d
* Cytoscape integration – 2d
* Node/edge selection + context panel – 2d
* Drag-to-connect flow – 1.5d
* Group/merge nodes – 2d
* Filters (entity type, search) – 1.5d
* Export UI – 1d
* Mobile mini-graph + answer-first – 2d

**Natural Query Integration**

* Scope picker + prompt bar – 1d
* Query API + results rendering – 2d
* Answer panel + citation chips – 1.5d

**Total MVP Graph Feature**: \~20–22 dev-days.

---

## 8. Open Questions

1. Should exports be **visual-only** (graph snapshot) or **report style** (summary + graph + evidence)?
2. Do users want to **share graphs** (read-only link) in MVP, or is solo export enough?
3. Should relationship types be **fixed** (mentions, linked-to, affiliated) or fully **customizable**?

---

✅ This document = **full Graphs feature spec** (vision + detailed requirements + backlog).

Would you like me to **mock up wireframes** (extension of your app’s UI: 3-pane graph builder, mobile answer-first flow) so you can hand both spec + visuals into Cursor?
