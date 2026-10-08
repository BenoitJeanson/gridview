/**
 * @license
 * Bundle of @powsybl/sankey 3.8.0-dev.0, with @svgdotjs/svg.js and
 * @svgdotjs/svg.panzoom.js linked in. Compiled, not modified.
 *
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 *
 * Source Form (MPL-2.0 s3.2(b)): https://github.com/powsybl/powsybl-network-viewer
 * branch sankey_bus_splitting, commit 0873dd1, packages/sankey. The build
 * command that produced this file is in vendor/README.md beside it, and the
 * full license text is in vendor/LICENSE-MPL-2.0.txt.
 *
 * Also contains, under the MIT license:
 *   @svgdotjs/svg.js          Copyright (c) 2012-2018 Wout Fierens
 *   @svgdotjs/svg.panzoom.js  Copyright (c) 2019 Ulrich-Matthias Schaefer
 * Full texts in vendor/LICENSE-MIT-svg.js.txt and
 * vendor/LICENSE-MIT-svg.panzoom.js.txt.
 */
"use strict";
var PowsyblSankey = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to2, from2, except, desc) => {
    if (from2 && typeof from2 === "object" || typeof from2 === "function") {
      for (let key of __getOwnPropNames(from2))
        if (!__hasOwnProp.call(to2, key) && key !== except)
          __defProp(to2, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
    }
    return to2;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    NB_TRANSITION_STEPS: () => NB_TRANSITION_STEPS,
    RafLoop: () => RafLoop,
    SankeyRenderer: () => SankeyRenderer,
    applyTopologyDiff: () => applyTopologyDiff,
    bandColor: () => bandColor,
    bandPath: () => bandPath,
    branchKey: () => branchKey,
    buildLayoutIndex: () => buildLayoutIndex,
    createFlowTransitionState: () => createFlowTransitionState,
    createMaxpmax: () => createMaxpmax,
    createSvgStructure: () => createSvgStructure,
    createTopologyTransitionState: () => createTopologyTransitionState,
    diffTopology: () => diffTopology,
    fitViewBox: () => fitViewBox,
    flatFromMap: () => flatFromMap,
    flatToMap: () => flatToMap,
    initStackCoord: () => initStackCoord,
    interpolateStep: () => interpolateStep,
    isTransitionDone: () => isTransitionDone,
    linearScale: () => linearScale,
    loadRatio: () => loadRatio,
    overloadBandPath: () => overloadBandPath,
    parseSfpd: () => parseSfpd,
    randomReset: () => randomReset,
    rearrangeStackCoord: () => rearrangeStackCoord,
    rearrangeStackCoordOffset: () => rearrangeStackCoordOffset,
    transitFlowsState: () => transitFlowsState,
    trianglePath: () => trianglePath,
    updateAttributes: () => updateAttributes,
    updateFlows: () => updateFlows
  });

  // src/core/datamodel.ts
  function branchKey(br) {
    return br.id === void 0 ? `${br.from_bus}->${br.to_bus}` : `${br.from_bus}->${br.to_bus}->${br.id}`;
  }
  function parseSfpd(busIds, branches, flows) {
    const result = /* @__PURE__ */ new Map();
    for (const busId of busIds) {
      const outgoing = [];
      const incoming = [];
      for (const br of branches) {
        if (br.from_bus !== busId && br.to_bus !== busId) continue;
        const key = branchKey(br);
        const p = flows.get(key) ?? 0;
        if (p === 0) {
          outgoing.push(key);
          incoming.push(key);
        } else if (br.from_bus === busId && p > 0 || br.to_bus === busId && p < 0) {
          outgoing.push(key);
        } else {
          incoming.push(key);
        }
      }
      result.set(busId, { outgoing, incoming });
    }
    return result;
  }
  function createMaxpmax(sfpd, flows) {
    const result = /* @__PURE__ */ new Map();
    for (const [busId, sp] of sfpd) {
      const sumList = (keys) => keys.reduce((acc, k) => acc + Math.abs(flows.get(k) ?? 0), 0);
      const maxpmax = Math.max(sumList(sp.outgoing), sumList(sp.incoming));
      result.set(busId, maxpmax);
    }
    return result;
  }
  function loadRatio(flow, pMax) {
    return Math.abs(flow) / pMax;
  }
  function bandColor(ratio) {
    if (ratio <= 0.8) return "green";
    if (ratio <= 1) return "orange";
    return "red";
  }

  // src/core/geometry.ts
  function n(v) {
    return String(Number.parseFloat(v.toPrecision(10)));
  }
  function bandPath(x1, x2, y1, y2, width2, isHorizontal) {
    const w2 = width2 / 2;
    if (isHorizontal) {
      const cp1x = -((2 * x1 + x2) / 3);
      const cp2x = -((x1 + 2 * x2) / 3);
      return `M ${n(-x1)} ${n(y1 - w2)} C ${n(cp1x)} ${n(y1 - w2)} ${n(cp2x)} ${n(y2 - w2)} ${n(-x2)} ${n(y2 - w2)} L ${n(-x2)} ${n(y2 + w2)} C ${n(cp2x)} ${n(y2 + w2)} ${n(cp1x)} ${n(y1 + w2)} ${n(-x1)} ${n(y1 + w2)} Z`;
    }
    const cp1y = -((2 * x1 + x2) / 3);
    const cp2y = -((x1 + 2 * x2) / 3);
    return `M ${n(y1 - w2)} ${n(-x1)} C ${n(y1 - w2)} ${n(cp1y)} ${n(y2 - w2)} ${n(cp2y)} ${n(y2 - w2)} ${n(-x2)} L ${n(y2 + w2)} ${n(-x2)} C ${n(y2 + w2)} ${n(cp2y)} ${n(y1 + w2)} ${n(cp1y)} ${n(y1 + w2)} ${n(-x1)} Z`;
  }
  function trianglePath(x2, y1, y2, width2, isHorizontal) {
    if (isHorizontal) {
      return `M ${n(-x2)} ${n(y1)} L ${n(-x2 + width2)} ${n((y1 + y2) / 2)} L ${n(-x2)} ${n(y2)} Z`;
    }
    return `M ${n(y1)} ${n(-x2)} L ${n((y1 + y2) / 2)} ${n(-x2 - width2)} L ${n(y2)} ${n(-x2)} Z`;
  }
  function overloadBandPath(x1, x2, y1, y2, p, pMax, isHorizontal) {
    if (p <= pMax) return null;
    const pOverload = p - pMax;
    const offset = pMax / 2;
    return bandPath(x1, x2, y1 + offset, y2 + offset, pOverload, isHorizontal);
  }
  function linearScale(domain, range) {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    const k = (r1 - r0) / (d1 - d0);
    return (v) => r0 + (v - d0) * k;
  }

  // src/core/layout.ts
  function oppositeBus(key, bus) {
    const parts = key.split("->");
    return parts[0] === bus ? parts[1] : parts[0];
  }
  function initStackCoord(busIds, branches) {
    const stackCoord = new Map(busIds.map((b) => [b, 0]));
    const stackCoordOffset = new Map(busIds.map((b) => [b, /* @__PURE__ */ new Map()]));
    for (const br of branches) {
      stackCoordOffset.get(br.from_bus)?.set(br.to_bus, 0);
      stackCoordOffset.get(br.to_bus)?.set(br.from_bus, 0);
    }
    return { stackCoord, stackCoordOffset };
  }
  function randomReset(stackCoord, scale = 1) {
    for (const bus of stackCoord.keys()) {
      stackCoord.set(bus, (Math.random() - 0.5) * scale);
    }
  }
  function rearrangeStackCoordOffset(stackCoordOffset, states, flows, stackCoord, sfpd, maxpmax) {
    for (const [bus, sp] of sfpd) {
      const scBus = stackCoord.get(bus);
      const stBus = states.get(bus);
      const halfMpm = (maxpmax.get(bus) ?? 0) / 2;
      const offMap = stackCoordOffset.get(bus);
      for (const branchKeys of [sp.outgoing, sp.incoming]) {
        if (branchKeys.length === 0) continue;
        const items = branchKeys.map((key) => ({
          opp: oppositeBus(key, bus),
          fl: Math.abs(flows.get(key) ?? 0)
        }));
        items.sort((a, b) => {
          const slopeOf = (busop) => {
            const num = stackCoord.get(busop) - scBus;
            const den = Math.max(1e-10, Math.abs(stBus - states.get(busop)));
            return num / den;
          };
          return slopeOf(a.opp) - slopeOf(b.opp);
        });
        let y0 = -halfMpm;
        for (const { opp: busop, fl } of items) {
          offMap.set(busop, y0 + fl / 2);
          y0 += fl;
        }
      }
    }
  }
  function buildLayoutIndex(busIds, sfpd, maxpmax) {
    const N = busIds.length;
    const busIndex = new Map(busIds.map((b, i) => [b, i]));
    const mpmFlat = new Float64Array(N);
    for (let i = 0; i < N; i++) mpmFlat[i] = maxpmax.get(busIds[i]) ?? 0;
    const adjOut = Array.from({ length: N }, () => []);
    const adjIn = Array.from({ length: N }, () => []);
    for (let i = 0; i < N; i++) {
      const sp = sfpd.get(busIds[i]);
      if (!sp) continue;
      const toIdx = (key) => busIndex.get(oppositeBus(key, busIds[i])) ?? -1;
      for (const key of sp.outgoing) {
        const j = toIdx(key);
        if (j >= 0) adjOut[i].push(j);
      }
      for (const key of sp.incoming) {
        const j = toIdx(key);
        if (j >= 0) adjIn[i].push(j);
      }
    }
    return { busArr: busIds, busIndex, mpmFlat, adjOut, adjIn, N, buf: new Float64Array(N * 2) };
  }
  function flatFromMap(idx, map2, out) {
    const { busArr, N } = idx;
    for (let i = 0; i < N; i++) out[i] = map2.get(busArr[i]) ?? 0;
  }
  function flatToMap(idx, flat, map2) {
    const { busArr, N } = idx;
    for (let i = 0; i < N; i++) map2.set(busArr[i], flat[i]);
  }
  function rearrangeStackCoord(idx, scFlat, stFlat, _flows, tanStrength, dRepulse) {
    const { N, mpmFlat, adjOut, adjIn, buf } = idx;
    const dTan = buf.subarray(0, N);
    const dRep = buf.subarray(N, 2 * N);
    for (let i = 0; i < N; i++) {
      const sci = scFlat[i];
      let tan = 0;
      for (const j of adjOut[i]) tan += sci - scFlat[j];
      for (const j of adjIn[i]) tan += sci - scFlat[j];
      dTan[i] = tan;
    }
    dRep.fill(0);
    for (let i = 0; i < N; i++) {
      const sci = scFlat[i];
      const mpmi = mpmFlat[i];
      const sti = stFlat[i];
      for (let j = i + 1; j < N; j++) {
        const dy2 = sci - scFlat[j];
        const dst = sti - stFlat[j];
        const absDst = Math.abs(dst);
        const width2 = (mpmi + mpmFlat[j]) * 0.5;
        const absDy = Math.abs(dy2);
        const absW = absDy - width2;
        const absWC = Math.max(absW, 0);
        const D2raw = absWC * absWC + 10 * absDst * absDst;
        const D2 = Math.max(D2raw, 0.05);
        const sign = Math.sign(dy2);
        const f = mpmi * mpmFlat[j] * sign / D2;
        dRep[i] += f;
        dRep[j] -= f;
      }
    }
    for (let i = 0; i < N; i++) {
      const maxStep = mpmFlat[i];
      let delta = -dTan[i] * tanStrength + dRep[i] * dRepulse;
      if (delta > maxStep) delta = maxStep;
      if (delta < -maxStep) delta = -maxStep;
      scFlat[i] = scFlat[i] + delta;
    }
  }

  // src/core/statemanager.ts
  var NB_TRANSITION_STEPS = 20;
  function interpolateStep(prev2, next2, step, totalSteps) {
    return (next2 * step + prev2 * (totalSteps - step)) / totalSteps;
  }
  function createFlowTransitionState(states, flows) {
    return {
      prevStates: new Map(states),
      nextStates: new Map(states),
      currentStates: new Map(states),
      prevFlows: new Map(flows),
      nextFlows: new Map(flows),
      currentFlows: new Map(flows),
      step: NB_TRANSITION_STEPS
    };
  }
  function isTransitionDone(ts) {
    return ts.step >= NB_TRANSITION_STEPS;
  }
  function transitFlowsState(ts) {
    if (ts.step >= NB_TRANSITION_STEPS) return;
    ts.step++;
    const { step, prevStates, nextStates, currentStates, prevFlows, nextFlows, currentFlows } = ts;
    for (const [bus, prev2] of prevStates) {
      currentStates.set(bus, interpolateStep(prev2, nextStates.get(bus) ?? prev2, step, NB_TRANSITION_STEPS));
    }
    for (const [key, prev2] of prevFlows) {
      currentFlows.set(key, interpolateStep(prev2, nextFlows.get(key) ?? prev2, step, NB_TRANSITION_STEPS));
    }
  }
  function createTopologyTransitionState(oldStates, oldFlows, newStates, newFlows) {
    const prevStates = /* @__PURE__ */ new Map();
    for (const [bus, angle] of newStates) {
      prevStates.set(bus, oldStates.get(bus) ?? angle);
    }
    const prevFlows = /* @__PURE__ */ new Map();
    for (const key of newFlows.keys()) {
      prevFlows.set(key, oldFlows.get(key) ?? 0);
    }
    return {
      prevStates,
      nextStates: new Map(newStates),
      currentStates: new Map(prevStates),
      prevFlows,
      nextFlows: new Map(newFlows),
      currentFlows: new Map(prevFlows),
      step: 0
    };
  }
  function updateFlows(ts, newStates, newFlows) {
    for (const [bus, v] of ts.currentStates) ts.prevStates.set(bus, v);
    for (const [key, v] of ts.currentFlows) ts.prevFlows.set(key, v);
    for (const [bus, v] of newStates) ts.nextStates.set(bus, v);
    for (const [key, v] of newFlows) ts.nextFlows.set(key, v);
    ts.step = 0;
  }

  // src/core/topology.ts
  function diffTopology(oldScenario, newScenario) {
    const oldBusIds = new Set(oldScenario.buses.map((b) => b.id));
    const newBusIds = new Set(newScenario.buses.map((b) => b.id));
    const oldBranchKeys = new Set(oldScenario.branches.map(branchKey));
    const newBranchKeys = new Set(newScenario.branches.map(branchKey));
    return {
      persistBusIds: newScenario.buses.filter((b) => oldBusIds.has(b.id)).map((b) => b.id),
      addedBuses: newScenario.buses.filter((b) => !oldBusIds.has(b.id)),
      removedBusIds: oldScenario.buses.filter((b) => !newBusIds.has(b.id)).map((b) => b.id),
      persistBranchKeys: newScenario.branches.filter((br) => oldBranchKeys.has(branchKey(br))).map(branchKey),
      addedBranches: newScenario.branches.filter((br) => !oldBranchKeys.has(branchKey(br))),
      removedBranchKeys: oldScenario.branches.filter((br) => !newBranchKeys.has(branchKey(br))).map(branchKey)
    };
  }

  // src/renderer/rafloop.ts
  var RafLoop = class {
    constructor(tick) {
      this.tick = tick;
    }
    tick;
    running = false;
    rafId = null;
    lastTs = 0;
    start() {
      if (this.running) return;
      this.running = true;
      this.lastTs = 0;
      const loop = (ts) => {
        if (!this.running) return;
        const dt = this.lastTs === 0 ? 16.67 : Math.min(Math.max(ts - this.lastTs, 1), 100);
        this.lastTs = ts;
        this.tick(dt);
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    }
    stop() {
      this.running = false;
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }
    isRunning() {
      return this.running;
    }
  };

  // src/renderer/renderer.ts
  var SVG_NS = "http://www.w3.org/2000/svg";
  var LABEL_GAP_STACK_FRACTION = 0.1;
  var LABEL_GAP_STATE_FRACTION = 0.01;
  function n2(v) {
    return String(Number.parseFloat(v.toPrecision(10)));
  }
  function el(tag) {
    return document.createElementNS(SVG_NS, tag);
  }
  function createBandElements(g) {
    const band = el("path");
    band.setAttribute("class", "band");
    band.setAttribute("fill-opacity", "0.7");
    g.appendChild(band);
    const overloadBand = el("path");
    overloadBand.setAttribute("class", "overload-band");
    overloadBand.setAttribute("fill", "url(#overload-hatch)");
    overloadBand.setAttribute("visibility", "hidden");
    g.appendChild(overloadBand);
    return { band, overloadBand };
  }
  function createBusElements(g, bus) {
    const pin = el("line");
    pin.setAttribute("class", "pin");
    pin.setAttribute("stroke", "black");
    pin.setAttribute("stroke-width", "4");
    pin.setAttribute("vector-effect", "non-scaling-stroke");
    g.appendChild(pin);
    const marker = el("path");
    marker.setAttribute("class", "marker");
    marker.setAttribute("fill", "steelblue");
    marker.setAttribute("fill-opacity", "0.8");
    g.appendChild(marker);
    const label = el("text");
    label.setAttribute("class", "label");
    label.textContent = bus.label ?? bus.id;
    g.appendChild(label);
    return { pin, marker, label };
  }
  var OVERLOAD_HATCH_SPACING_PX = 8;
  function createOverloadHatchPattern(g) {
    const pattern = el("pattern");
    pattern.setAttribute("id", "overload-hatch");
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    const stripe = el("rect");
    stripe.setAttribute("fill", "darkmagenta");
    stripe.setAttribute("fill-opacity", "0.75");
    pattern.appendChild(stripe);
    g.appendChild(pattern);
  }
  function updateOverloadHatchPattern(svg2, isHorizontal, ux, uy) {
    const pattern = svg2.querySelector("#overload-hatch");
    const stripe = pattern?.querySelector("rect");
    if (!pattern || !stripe) return;
    const pitch = OVERLOAD_HATCH_SPACING_PX * (isHorizontal ? ux : uy);
    pattern.setAttribute("width", n2(pitch));
    pattern.setAttribute("height", n2(pitch));
    if (isHorizontal) {
      stripe.setAttribute("width", n2(pitch / 2));
      stripe.setAttribute("height", n2(pitch));
    } else {
      stripe.setAttribute("width", n2(pitch));
      stripe.setAttribute("height", n2(pitch / 2));
    }
  }
  function createSvgStructure(svg2, scenario) {
    const g = el("g");
    svg2.appendChild(g);
    createOverloadHatchPattern(g);
    const bands = [];
    const overloadBands = [];
    const branchKeys = [];
    const pMaxValues = [];
    for (const br of scenario.branches) {
      const { band, overloadBand } = createBandElements(g);
      bands.push(band);
      overloadBands.push(overloadBand);
      branchKeys.push(branchKey(br));
      pMaxValues.push(br.p_max);
    }
    const pins = [];
    const markers = [];
    const labels = [];
    for (const bus of scenario.buses) {
      const { pin, marker, label } = createBusElements(g, bus);
      pins.push(pin);
      markers.push(marker);
      labels.push(label);
    }
    return { diagramGroup: g, bands, overloadBands, pins, markers, labels, branchKeys, pMaxValues };
  }
  function applyTopologyDiff(elements2, oldScenario, newScenario, diff) {
    const g = elements2.diagramGroup;
    const busEls = /* @__PURE__ */ new Map();
    for (let i = 0; i < oldScenario.buses.length; i++)
      busEls.set(oldScenario.buses[i].id, {
        pin: elements2.pins[i],
        marker: elements2.markers[i],
        label: elements2.labels[i]
      });
    const branchEls = /* @__PURE__ */ new Map();
    for (let i = 0; i < elements2.branchKeys.length; i++)
      branchEls.set(elements2.branchKeys[i], { band: elements2.bands[i], overloadBand: elements2.overloadBands[i] });
    for (const id of diff.removedBusIds) {
      const e = busEls.get(id);
      if (e) {
        e.pin.remove();
        e.marker.remove();
        e.label.remove();
      }
    }
    for (const key of diff.removedBranchKeys) {
      const e = branchEls.get(key);
      if (e) {
        e.band.remove();
        e.overloadBand.remove();
      }
    }
    const enteredBus = /* @__PURE__ */ new Map();
    for (const bus of diff.addedBuses) enteredBus.set(bus.id, createBusElements(g, bus));
    const enteredBranch = /* @__PURE__ */ new Map();
    for (const br of diff.addedBranches) {
      const key = branchKey(br);
      enteredBranch.set(key, createBandElements(g));
    }
    const bands = [];
    const overloadBands = [];
    const newBranchKeys = [];
    const pMaxValues = [];
    for (const br of newScenario.branches) {
      const key = branchKey(br);
      const e = branchEls.get(key) ?? enteredBranch.get(key);
      bands.push(e.band);
      overloadBands.push(e.overloadBand);
      newBranchKeys.push(key);
      pMaxValues.push(br.p_max);
    }
    const pins = [];
    const markers = [];
    const labels = [];
    for (const bus of newScenario.buses) {
      const e = busEls.get(bus.id) ?? enteredBus.get(bus.id);
      pins.push(e.pin);
      markers.push(e.marker);
      labels.push(e.label);
    }
    return { diagramGroup: g, bands, overloadBands, pins, markers, labels, branchKeys: newBranchKeys, pMaxValues };
  }
  function updateBusElement(pin, marker, label, bus, state, maxpmax, ctx) {
    const { states, stackCoord, stretch, isHorizontal } = state;
    const { sMin, sMax, ux, uy, triangleWidth, injection } = ctx;
    const x2 = states.get(bus.id) ?? 0;
    const sc = (stackCoord.get(bus.id) ?? 0) * stretch;
    const mpm = maxpmax.get(bus.id) ?? 0;
    const yLo = sc - mpm / 2;
    const yHi = sc + mpm / 2;
    if (isHorizontal) {
      pin.setAttribute("x1", String(-x2));
      pin.setAttribute("x2", String(-x2));
      pin.setAttribute("y1", String(yLo));
      pin.setAttribute("y2", String(yHi));
    } else {
      pin.setAttribute("x1", String(yLo));
      pin.setAttribute("x2", String(yHi));
      pin.setAttribute("y1", String(-x2));
      pin.setAttribute("y2", String(-x2));
    }
    const labelGapStack = mpm * LABEL_GAP_STACK_FRACTION;
    const labelGapState = Math.max(1e-6, sMax - sMin) * LABEL_GAP_STATE_FRACTION;
    const lx = isHorizontal ? -x2 + labelGapState : yLo - labelGapStack;
    const ly = isHorizontal ? yLo - labelGapStack : -x2 - labelGapState;
    label.setAttribute("transform", `translate(${n2(lx)} ${n2(ly)}) scale(${n2(ux)} ${n2(uy)})`);
    const netInj = injection.get(bus.id) ?? 0;
    const absInj = Math.abs(netInj);
    if (absInj > 0) {
      const tw = triangleWidth;
      const markerX = netInj > 0 ? x2 : x2 + tw;
      const markerW = isHorizontal ? tw : -tw;
      marker.setAttribute("d", trianglePath(markerX, yHi - absInj, yHi, markerW, isHorizontal));
    } else {
      marker.setAttribute("d", "");
    }
  }
  function updateAttributes(elements2, scenario, state, maxpmax) {
    const { bands, overloadBands, pins, markers, labels, branchKeys, pMaxValues } = elements2;
    const { states, flows, stackCoord, stackCoordOffset, stretch, isHorizontal } = state;
    const injection = /* @__PURE__ */ new Map();
    for (const bus of scenario.buses) injection.set(bus.id, 0);
    for (let i = 0; i < scenario.branches.length; i++) {
      const br = scenario.branches[i];
      const flow = flows.get(branchKeys[i]) ?? 0;
      injection.set(br.from_bus, (injection.get(br.from_bus) ?? 0) - flow);
      injection.set(br.to_bus, (injection.get(br.to_bus) ?? 0) + flow);
    }
    const stateVals = [...states.values()];
    const sMin = Math.min(...stateVals);
    const sMax = Math.max(...stateVals);
    const triangleWidth = Math.max(1e-6, sMax - sMin) / 100;
    const svgEl = elements2.diagramGroup.ownerSVGElement;
    const vb = svgEl.viewBox.baseVal;
    const svgW = Math.max(1, svgEl.clientWidth);
    const svgH = Math.max(1, svgEl.clientHeight);
    const ux = vb.width / svgW;
    const uy = vb.height / svgH;
    updateOverloadHatchPattern(svgEl, isHorizontal, ux, uy);
    for (let i = 0; i < scenario.branches.length; i++) {
      const br = scenario.branches[i];
      const flow = flows.get(branchKeys[i]) ?? 0;
      const absFlow = flow < 0 ? -flow : flow;
      const pMax = pMaxValues[i];
      const x1 = states.get(br.from_bus) ?? 0;
      const x2 = states.get(br.to_bus) ?? 0;
      const y1 = (stackCoord.get(br.from_bus) ?? 0) * stretch + (stackCoordOffset.get(br.from_bus)?.get(br.to_bus) ?? 0);
      const y2 = (stackCoord.get(br.to_bus) ?? 0) * stretch + (stackCoordOffset.get(br.to_bus)?.get(br.from_bus) ?? 0);
      bands[i].setAttribute("d", bandPath(x1, x2, y1, y2, absFlow, isHorizontal));
      bands[i].setAttribute("fill", bandColor(loadRatio(absFlow, pMax)));
      if (br.outage) {
        bands[i].setAttribute("stroke", "black");
        bands[i].setAttribute("stroke-width", "2");
        bands[i].setAttribute("vector-effect", "non-scaling-stroke");
      } else {
        bands[i].setAttribute("stroke", "none");
      }
      const overloadPath = overloadBandPath(x1, x2, y1, y2, absFlow, pMax, isHorizontal);
      if (overloadPath === null) {
        overloadBands[i].setAttribute("visibility", "hidden");
      } else {
        overloadBands[i].setAttribute("d", overloadPath);
        overloadBands[i].setAttribute("visibility", "visible");
      }
    }
    const ctx = { sMin, sMax, ux, uy, triangleWidth, injection };
    for (let i = 0; i < scenario.buses.length; i++) {
      updateBusElement(pins[i], markers[i], labels[i], scenario.buses[i], state, maxpmax, ctx);
    }
  }
  function fitViewBox(svg2, scenario, state, maxpmax) {
    const { states, stackCoord, stretch, isHorizontal } = state;
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    for (const bus of scenario.buses) {
      const x2 = states.get(bus.id) ?? 0;
      const sc = (stackCoord.get(bus.id) ?? 0) * stretch;
      const mpm = maxpmax.get(bus.id) ?? 0;
      xMin = Math.min(x2, xMin);
      xMax = Math.max(x2, xMax);
      const lo = sc - mpm / 2;
      const hi = sc + mpm / 2;
      yMin = Math.min(lo, yMin);
      yMax = Math.max(hi, yMax);
    }
    if (!Number.isFinite(xMin)) {
      xMin = -1;
      xMax = 1;
    }
    if (!Number.isFinite(yMin)) {
      yMin = -1;
      yMax = 1;
    }
    const xPad = Math.max(1e-6, xMax - xMin) * 0.05;
    const yPad = Math.max(1e-6, yMax - yMin) * 0.1;
    const vbY = yMin - yPad;
    const vbW = xMax - xMin + 2 * xPad;
    const vbH = yMax - yMin + 2 * yPad;
    if (isHorizontal) {
      svg2.setAttribute("viewBox", `${-xMax - xPad} ${vbY} ${vbW} ${vbH}`);
    } else {
      const svgXMin = yMin - yPad;
      const svgYMin = -xMax - xPad;
      const svgW = yMax - yMin + 2 * yPad;
      const svgH = xMax - xMin + 2 * xPad;
      svg2.setAttribute("viewBox", `${svgXMin} ${svgYMin} ${svgW} ${svgH}`);
    }
    svg2.setAttribute("preserveAspectRatio", "none");
  }

  // ../../node_modules/@svgdotjs/svg.js/dist/svg.esm.js
  /*!
  * @svgdotjs/svg.js - A lightweight library for manipulating and animating SVG.
  * @version 3.2.8
  * https://svgjs.dev/
  *
  * @copyright Wout Fierens <wout@mick-wout.com>
  * @license MIT
  *
  * BUILT: 2026-08-04T07:47:41.000Z
  */
  var __create = Object.create;
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames2 = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp2 = Object.prototype.hasOwnProperty;
  var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
  var __exportAll = (all, no_symbols) => {
    let target = {};
    for (var name in all) {
      __defProp2(target, name, {
        get: all[name],
        enumerable: true
      });
    }
    if (!no_symbols) {
      __defProp2(target, Symbol.toStringTag, { value: "Module" });
    }
    return target;
  };
  var __copyProps2 = (to2, from2, except, desc) => {
    if (from2 && typeof from2 === "object" || typeof from2 === "function") {
      for (var keys = __getOwnPropNames2(from2), i = 0, n3 = keys.length, key; i < n3; i++) {
        key = keys[i];
        if (!__hasOwnProp2.call(to2, key) && key !== except) {
          __defProp2(to2, key, {
            get: ((k) => from2[k]).bind(null, key),
            enumerable: !(desc = __getOwnPropDesc2(from2, key)) || desc.enumerable
          });
        }
      }
    }
    return to2;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps2(isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", {
    value: mod,
    enumerable: true
  }) : target, mod));
  var methods = {};
  var names = [];
  function registerMethods(name, m) {
    if (Array.isArray(name)) {
      for (const _name of name) registerMethods(_name, m);
      return;
    }
    if (typeof name === "object") {
      for (const _name in name) registerMethods(_name, name[_name]);
      return;
    }
    addMethodNames(Object.getOwnPropertyNames(m));
    methods[name] = Object.assign(methods[name] || {}, m);
  }
  function getMethodsFor(name) {
    return methods[name] || {};
  }
  function getMethodNames() {
    return [...new Set(names)];
  }
  function addMethodNames(_names) {
    names.push(..._names);
  }
  var require_fails = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    module.exports = function(exec) {
      try {
        return !!exec();
      } catch (error) {
        return true;
      }
    };
  }));
  var require_function_bind_native = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var fails = require_fails();
    module.exports = !fails(function() {
      var test = function() {
      }.bind();
      return typeof test != "function" || test.hasOwnProperty("prototype");
    });
  }));
  var require_function_uncurry_this = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var NATIVE_BIND = require_function_bind_native();
    var FunctionPrototype = Function.prototype;
    var call = FunctionPrototype.call;
    var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);
    module.exports = NATIVE_BIND ? uncurryThisWithBind : function(fn) {
      return function() {
        return call.apply(fn, arguments);
      };
    };
  }));
  var require_object_is_prototype_of = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var uncurryThis = require_function_uncurry_this();
    module.exports = uncurryThis({}.isPrototypeOf);
  }));
  var require_global_this = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var check = function(it) {
      return it && it.Math === Math && it;
    };
    module.exports = check(typeof globalThis == "object" && globalThis) || check(typeof window == "object" && window) || check(typeof self == "object" && self) || check(typeof global == "object" && global) || check(typeof exports == "object" && exports) || /* @__PURE__ */ (function() {
      return this;
    })() || Function("return this")();
  }));
  var require_function_apply = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var NATIVE_BIND = require_function_bind_native();
    var FunctionPrototype = Function.prototype;
    var apply = FunctionPrototype.apply;
    var call = FunctionPrototype.call;
    module.exports = typeof Reflect == "object" && Reflect.apply || (NATIVE_BIND ? call.bind(apply) : function() {
      return call.apply(apply, arguments);
    });
  }));
  var require_classof_raw = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var uncurryThis = require_function_uncurry_this();
    var toString = uncurryThis({}.toString);
    var stringSlice = uncurryThis("".slice);
    module.exports = function(it) {
      return stringSlice(toString(it), 8, -1);
    };
  }));
  var require_function_uncurry_this_clause = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var classofRaw = require_classof_raw();
    var uncurryThis = require_function_uncurry_this();
    module.exports = function(fn) {
      if (classofRaw(fn) === "Function") return uncurryThis(fn);
    };
  }));
  var require_is_callable = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var documentAll = typeof document == "object" && document.all;
    module.exports = typeof documentAll == "undefined" && documentAll !== void 0 ? function(argument) {
      return typeof argument == "function" || argument === documentAll;
    } : function(argument) {
      return typeof argument == "function";
    };
  }));
  var require_descriptors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var fails = require_fails();
    module.exports = !fails(function() {
      return Object.defineProperty({}, 1, { get: function() {
        return 7;
      } })[1] !== 7;
    });
  }));
  var require_function_call = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var NATIVE_BIND = require_function_bind_native();
    var call = Function.prototype.call;
    module.exports = NATIVE_BIND ? call.bind(call) : function() {
      return call.apply(call, arguments);
    };
  }));
  var require_object_property_is_enumerable = /* @__PURE__ */ __commonJSMin(((exports) => {
    var $propertyIsEnumerable = {}.propertyIsEnumerable;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);
    exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
      var descriptor = getOwnPropertyDescriptor(this, V);
      return !!descriptor && descriptor.enumerable;
    } : $propertyIsEnumerable;
  }));
  var require_create_property_descriptor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    module.exports = function(bitmap, value) {
      return {
        enumerable: !(bitmap & 1),
        configurable: !(bitmap & 2),
        writable: !(bitmap & 4),
        value
      };
    };
  }));
  var require_indexed_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var uncurryThis = require_function_uncurry_this();
    var fails = require_fails();
    var classof = require_classof_raw();
    var $Object = Object;
    var split = uncurryThis("".split);
    module.exports = fails(function() {
      return !$Object("z").propertyIsEnumerable(0);
    }) ? function(it) {
      return classof(it) === "String" ? split(it, "") : $Object(it);
    } : $Object;
  }));
  var require_is_null_or_undefined = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    module.exports = function(it) {
      return it === null || it === void 0;
    };
  }));
  var require_require_object_coercible = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var isNullOrUndefined = require_is_null_or_undefined();
    var $TypeError = TypeError;
    module.exports = function(it) {
      if (isNullOrUndefined(it)) throw new $TypeError("Can't call method on " + it);
      return it;
    };
  }));
  var require_to_indexed_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var IndexedObject = require_indexed_object();
    var requireObjectCoercible = require_require_object_coercible();
    module.exports = function(it) {
      return IndexedObject(requireObjectCoercible(it));
    };
  }));
  var require_is_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var isCallable = require_is_callable();
    module.exports = function(it) {
      return typeof it == "object" ? it !== null : isCallable(it);
    };
  }));
  var require_path = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    module.exports = {};
  }));
  var require_get_built_in = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var path = require_path();
    var globalThis2 = require_global_this();
    var isCallable = require_is_callable();
    var aFunction = function(variable) {
      return isCallable(variable) ? variable : void 0;
    };
    module.exports = function(namespace, method) {
      return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(globalThis2[namespace]) : path[namespace] && path[namespace][method] || globalThis2[namespace] && globalThis2[namespace][method];
    };
  }));
  var require_environment_user_agent = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var navigator = require_global_this().navigator;
    var userAgent = navigator && navigator.userAgent;
    module.exports = userAgent ? String(userAgent) : "";
  }));
  var require_environment_v8_version = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var globalThis2 = require_global_this();
    var userAgent = require_environment_user_agent();
    var process = globalThis2.process;
    var Deno = globalThis2.Deno;
    var versions = process && process.versions || Deno && Deno.version;
    var v8 = versions && versions.v8;
    var match;
    var version;
    if (v8) {
      match = v8.split(".");
      version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
    }
    if (!version && userAgent) {
      match = userAgent.match(/Edge\/(\d+)/);
      if (!match || match[1] >= 74) {
        match = userAgent.match(/Chrome\/(\d+)/);
        if (match) version = +match[1];
      }
    }
    module.exports = version;
  }));
  var require_symbol_constructor_detection = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var V8_VERSION = require_environment_v8_version();
    var fails = require_fails();
    var $String = require_global_this().String;
    module.exports = !!Object.getOwnPropertySymbols && !fails(function() {
      var symbol = /* @__PURE__ */ Symbol("symbol detection");
      return !$String(symbol) || !(Object(symbol) instanceof Symbol) || !Symbol.sham && V8_VERSION && V8_VERSION < 41;
    });
  }));
  var require_use_symbol_as_uid = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var NATIVE_SYMBOL = require_symbol_constructor_detection();
    module.exports = NATIVE_SYMBOL && !Symbol.sham && typeof Symbol.iterator == "symbol";
  }));
  var require_is_symbol = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var getBuiltIn = require_get_built_in();
    var isCallable = require_is_callable();
    var isPrototypeOf = require_object_is_prototype_of();
    var USE_SYMBOL_AS_UID = require_use_symbol_as_uid();
    var $Object = Object;
    module.exports = USE_SYMBOL_AS_UID ? function(it) {
      return typeof it == "symbol";
    } : function(it) {
      var $Symbol = getBuiltIn("Symbol");
      return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
    };
  }));
  var require_try_to_string = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var $String = String;
    module.exports = function(argument) {
      try {
        return $String(argument);
      } catch (error) {
        return "Object";
      }
    };
  }));
  var require_a_callable = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var isCallable = require_is_callable();
    var tryToString = require_try_to_string();
    var $TypeError = TypeError;
    module.exports = function(argument) {
      if (isCallable(argument)) return argument;
      throw new $TypeError(tryToString(argument) + " is not a function");
    };
  }));
  var require_get_method = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var aCallable = require_a_callable();
    var isNullOrUndefined = require_is_null_or_undefined();
    module.exports = function(V, P) {
      var func = V[P];
      return isNullOrUndefined(func) ? void 0 : aCallable(func);
    };
  }));
  var require_ordinary_to_primitive = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var call = require_function_call();
    var isCallable = require_is_callable();
    var isObject = require_is_object();
    var $TypeError = TypeError;
    module.exports = function(input, pref) {
      var fn, val;
      if (pref === "string" && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
      if (isCallable(fn = input.valueOf) && !isObject(val = call(fn, input))) return val;
      if (pref !== "string" && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
      throw new $TypeError("Can't convert object to primitive value");
    };
  }));
  var require_is_pure = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    module.exports = true;
  }));
  var require_define_global_property = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var globalThis2 = require_global_this();
    var defineProperty = Object.defineProperty;
    module.exports = function(key, value) {
      try {
        defineProperty(globalThis2, key, {
          value,
          configurable: true,
          writable: true
        });
      } catch (error) {
        globalThis2[key] = value;
      }
      return value;
    };
  }));
  var require_shared_store = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var IS_PURE = require_is_pure();
    var globalThis2 = require_global_this();
    var defineGlobalProperty = require_define_global_property();
    var SHARED = "__core-js_shared__";
    var store = module.exports = globalThis2[SHARED] || defineGlobalProperty(SHARED, {});
    (store.versions || (store.versions = [])).push({
      version: "3.49.0",
      mode: IS_PURE ? "pure" : "global",
      copyright: "\xA9 2013\u20132025 Denis Pushkarev (zloirock.ru), 2025\u20132026 CoreJS Company (core-js.io). All rights reserved.",
      license: "https://github.com/zloirock/core-js/blob/v3.49.0/LICENSE",
      source: "https://github.com/zloirock/core-js"
    });
  }));
  var require_shared = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var store = require_shared_store();
    module.exports = function(key, value) {
      return store[key] || (store[key] = value || {});
    };
  }));
  var require_to_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var requireObjectCoercible = require_require_object_coercible();
    var $Object = Object;
    module.exports = function(argument) {
      return $Object(requireObjectCoercible(argument));
    };
  }));
  var require_has_own_property = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var uncurryThis = require_function_uncurry_this();
    var toObject = require_to_object();
    var hasOwnProperty = uncurryThis({}.hasOwnProperty);
    module.exports = Object.hasOwn || function hasOwn(it, key) {
      return hasOwnProperty(toObject(it), key);
    };
  }));
  var require_uid = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var uncurryThis = require_function_uncurry_this();
    var id = 0;
    var postfix = Math.random();
    var toString = uncurryThis(1.1.toString);
    module.exports = function(key) {
      return "Symbol(" + (key === void 0 ? "" : key) + ")_" + toString(++id + postfix, 36);
    };
  }));
  var require_well_known_symbol = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var globalThis2 = require_global_this();
    var shared = require_shared();
    var hasOwn = require_has_own_property();
    var uid = require_uid();
    var NATIVE_SYMBOL = require_symbol_constructor_detection();
    var USE_SYMBOL_AS_UID = require_use_symbol_as_uid();
    var Symbol2 = globalThis2.Symbol;
    var WellKnownSymbolsStore = shared("wks");
    var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol2["for"] || Symbol2 : Symbol2 && Symbol2.withoutSetter || uid;
    module.exports = function(name) {
      if (!hasOwn(WellKnownSymbolsStore, name)) WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn(Symbol2, name) ? Symbol2[name] : createWellKnownSymbol("Symbol." + name);
      return WellKnownSymbolsStore[name];
    };
  }));
  var require_to_primitive = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var call = require_function_call();
    var isObject = require_is_object();
    var isSymbol = require_is_symbol();
    var getMethod = require_get_method();
    var ordinaryToPrimitive = require_ordinary_to_primitive();
    var wellKnownSymbol = require_well_known_symbol();
    var $TypeError = TypeError;
    var TO_PRIMITIVE = wellKnownSymbol("toPrimitive");
    module.exports = function(input, pref) {
      if (!isObject(input) || isSymbol(input)) return input;
      var exoticToPrim = getMethod(input, TO_PRIMITIVE);
      var result;
      if (exoticToPrim) {
        if (pref === void 0) pref = "default";
        result = call(exoticToPrim, input, pref);
        if (!isObject(result) || isSymbol(result)) return result;
        throw new $TypeError("Can't convert object to primitive value");
      }
      if (pref === void 0) pref = "number";
      return ordinaryToPrimitive(input, pref);
    };
  }));
  var require_to_property_key = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var toPrimitive = require_to_primitive();
    var isSymbol = require_is_symbol();
    module.exports = function(argument) {
      var key = toPrimitive(argument, "string");
      return isSymbol(key) ? key : key + "";
    };
  }));
  var require_document_create_element = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var globalThis2 = require_global_this();
    var isObject = require_is_object();
    var document2 = globalThis2.document;
    var EXISTS = isObject(document2) && isObject(document2.createElement);
    module.exports = function(it) {
      return EXISTS ? document2.createElement(it) : {};
    };
  }));
  var require_ie8_dom_define = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var DESCRIPTORS = require_descriptors();
    var fails = require_fails();
    var createElement = require_document_create_element();
    module.exports = !DESCRIPTORS && !fails(function() {
      return Object.defineProperty(createElement("div"), "a", { get: function() {
        return 7;
      } }).a !== 7;
    });
  }));
  var require_object_get_own_property_descriptor = /* @__PURE__ */ __commonJSMin(((exports) => {
    var DESCRIPTORS = require_descriptors();
    var call = require_function_call();
    var propertyIsEnumerableModule = require_object_property_is_enumerable();
    var createPropertyDescriptor = require_create_property_descriptor();
    var toIndexedObject = require_to_indexed_object();
    var toPropertyKey = require_to_property_key();
    var hasOwn = require_has_own_property();
    var IE8_DOM_DEFINE = require_ie8_dom_define();
    var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    exports.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
      O = toIndexedObject(O);
      P = toPropertyKey(P);
      if (IE8_DOM_DEFINE) try {
        return $getOwnPropertyDescriptor(O, P);
      } catch (error) {
      }
      if (hasOwn(O, P)) return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O, P), O[P]);
    };
  }));
  var require_is_forced = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var fails = require_fails();
    var isCallable = require_is_callable();
    var replacement = /#|\.prototype\./;
    var isForced = function(feature, detection) {
      var value = data2[normalize(feature)];
      return value === POLYFILL ? true : value === NATIVE ? false : isCallable(detection) ? fails(detection) : !!detection;
    };
    var normalize = isForced.normalize = function(string) {
      return String(string).replace(replacement, ".").toLowerCase();
    };
    var data2 = isForced.data = {};
    var NATIVE = isForced.NATIVE = "N";
    var POLYFILL = isForced.POLYFILL = "P";
    module.exports = isForced;
  }));
  var require_function_bind_context = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var uncurryThis = require_function_uncurry_this_clause();
    var aCallable = require_a_callable();
    var NATIVE_BIND = require_function_bind_native();
    var bind = uncurryThis(uncurryThis.bind);
    module.exports = function(fn, that) {
      aCallable(fn);
      return that === void 0 ? fn : NATIVE_BIND ? bind(fn, that) : function() {
        return fn.apply(that, arguments);
      };
    };
  }));
  var require_v8_prototype_define_bug = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var DESCRIPTORS = require_descriptors();
    var fails = require_fails();
    module.exports = DESCRIPTORS && fails(function() {
      return Object.defineProperty(function() {
      }, "prototype", {
        value: 42,
        writable: false
      }).prototype !== 42;
    });
  }));
  var require_an_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var isObject = require_is_object();
    var $String = String;
    var $TypeError = TypeError;
    module.exports = function(argument) {
      if (isObject(argument)) return argument;
      throw new $TypeError($String(argument) + " is not an object");
    };
  }));
  var require_object_define_property = /* @__PURE__ */ __commonJSMin(((exports) => {
    var DESCRIPTORS = require_descriptors();
    var IE8_DOM_DEFINE = require_ie8_dom_define();
    var V8_PROTOTYPE_DEFINE_BUG = require_v8_prototype_define_bug();
    var anObject = require_an_object();
    var toPropertyKey = require_to_property_key();
    var $TypeError = TypeError;
    var $defineProperty = Object.defineProperty;
    var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var ENUMERABLE = "enumerable";
    var CONFIGURABLE = "configurable";
    var WRITABLE = "writable";
    exports.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
      anObject(O);
      P = toPropertyKey(P);
      anObject(Attributes);
      if (typeof O === "function" && P === "prototype" && "value" in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
        var current = $getOwnPropertyDescriptor(O, P);
        if (current && current[WRITABLE]) {
          O[P] = Attributes.value;
          Attributes = {
            configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
            enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
            writable: false
          };
        }
      }
      return $defineProperty(O, P, Attributes);
    } : $defineProperty : function defineProperty(O, P, Attributes) {
      anObject(O);
      P = toPropertyKey(P);
      anObject(Attributes);
      if (IE8_DOM_DEFINE) try {
        return $defineProperty(O, P, Attributes);
      } catch (error) {
      }
      if ("get" in Attributes || "set" in Attributes) throw new $TypeError("Accessors not supported");
      if ("value" in Attributes) O[P] = Attributes.value;
      return O;
    };
  }));
  var require_create_non_enumerable_property = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var DESCRIPTORS = require_descriptors();
    var definePropertyModule = require_object_define_property();
    var createPropertyDescriptor = require_create_property_descriptor();
    module.exports = DESCRIPTORS ? function(object, key, value) {
      return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
    } : function(object, key, value) {
      object[key] = value;
      return object;
    };
  }));
  var require_export = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var globalThis2 = require_global_this();
    var apply = require_function_apply();
    var uncurryThis = require_function_uncurry_this_clause();
    var isCallable = require_is_callable();
    var getOwnPropertyDescriptor = require_object_get_own_property_descriptor().f;
    var isForced = require_is_forced();
    var path = require_path();
    var bind = require_function_bind_context();
    var createNonEnumerableProperty = require_create_non_enumerable_property();
    var hasOwn = require_has_own_property();
    require_shared_store();
    var wrapConstructor = function(NativeConstructor) {
      var Wrapper = function(a, b, c) {
        if (this instanceof Wrapper) {
          switch (arguments.length) {
            case 0:
              return new NativeConstructor();
            case 1:
              return new NativeConstructor(a);
            case 2:
              return new NativeConstructor(a, b);
          }
          return new NativeConstructor(a, b, c);
        }
        return apply(NativeConstructor, this, arguments);
      };
      Wrapper.prototype = NativeConstructor.prototype;
      return Wrapper;
    };
    module.exports = function(options, source) {
      var TARGET = options.target;
      var GLOBAL = options.global;
      var STATIC = options.stat;
      var PROTO = options.proto;
      var nativeSource = GLOBAL ? globalThis2 : STATIC ? globalThis2[TARGET] : globalThis2[TARGET] && globalThis2[TARGET].prototype;
      var target = GLOBAL ? path : path[TARGET] || createNonEnumerableProperty(path, TARGET, {})[TARGET];
      var targetPrototype = target.prototype;
      var FORCED, USE_NATIVE, VIRTUAL_PROTOTYPE;
      var key, sourceProperty, targetProperty, nativeProperty, resultProperty, descriptor;
      for (key in source) {
        FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? "." : "#") + key, options.forced);
        USE_NATIVE = !FORCED && nativeSource && hasOwn(nativeSource, key);
        targetProperty = target[key];
        if (USE_NATIVE) if (options.dontCallGetSet) {
          descriptor = getOwnPropertyDescriptor(nativeSource, key);
          nativeProperty = descriptor && descriptor.value;
        } else nativeProperty = nativeSource[key];
        sourceProperty = USE_NATIVE && nativeProperty ? nativeProperty : source[key];
        if (!FORCED && !PROTO && typeof targetProperty == typeof sourceProperty) continue;
        if (options.bind && USE_NATIVE) resultProperty = bind(sourceProperty, globalThis2);
        else if (options.wrap && USE_NATIVE) resultProperty = wrapConstructor(sourceProperty);
        else if (PROTO && isCallable(sourceProperty)) resultProperty = uncurryThis(sourceProperty);
        else resultProperty = sourceProperty;
        if (options.sham || sourceProperty && sourceProperty.sham || targetProperty && targetProperty.sham) createNonEnumerableProperty(resultProperty, "sham", true);
        createNonEnumerableProperty(target, key, resultProperty);
        if (PROTO) {
          VIRTUAL_PROTOTYPE = TARGET + "Prototype";
          if (!hasOwn(path, VIRTUAL_PROTOTYPE)) createNonEnumerableProperty(path, VIRTUAL_PROTOTYPE, {});
          createNonEnumerableProperty(path[VIRTUAL_PROTOTYPE], key, sourceProperty);
          if (options.real && targetPrototype && (FORCED || !targetPrototype[key])) createNonEnumerableProperty(targetPrototype, key, sourceProperty);
        }
      }
    };
  }));
  var require_math_trunc = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var ceil = Math.ceil;
    var floor = Math.floor;
    module.exports = Math.trunc || function trunc(x2) {
      var n3 = +x2;
      return (n3 > 0 ? floor : ceil)(n3);
    };
  }));
  var require_to_integer_or_infinity = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var trunc = require_math_trunc();
    module.exports = function(argument) {
      var number = +argument;
      return number !== number || number === 0 ? 0 : trunc(number);
    };
  }));
  var require_to_absolute_index = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var toIntegerOrInfinity = require_to_integer_or_infinity();
    var max = Math.max;
    var min = Math.min;
    module.exports = function(index, length2) {
      var integer = toIntegerOrInfinity(index);
      return integer < 0 ? max(integer + length2, 0) : min(integer, length2);
    };
  }));
  var require_to_length = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var toIntegerOrInfinity = require_to_integer_or_infinity();
    var min = Math.min;
    module.exports = function(argument) {
      var len = toIntegerOrInfinity(argument);
      return len > 0 ? min(len, 9007199254740991) : 0;
    };
  }));
  var require_length_of_array_like = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var toLength = require_to_length();
    module.exports = function(obj) {
      return toLength(obj.length);
    };
  }));
  var require_array_includes = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var toIndexedObject = require_to_indexed_object();
    var toAbsoluteIndex = require_to_absolute_index();
    var lengthOfArrayLike = require_length_of_array_like();
    var createMethod = function(IS_INCLUDES) {
      return function($this, el2, fromIndex) {
        var O = toIndexedObject($this);
        var length2 = lengthOfArrayLike(O);
        if (length2 === 0) return !IS_INCLUDES && -1;
        var index = toAbsoluteIndex(fromIndex, length2);
        var value;
        if (IS_INCLUDES && el2 !== el2) while (length2 > index) {
          value = O[index++];
          if (value !== value) return true;
        }
        else for (; length2 > index; index++) if ((IS_INCLUDES || index in O) && O[index] === el2) return IS_INCLUDES || index || 0;
        return !IS_INCLUDES && -1;
      };
    };
    module.exports = {
      includes: createMethod(true),
      indexOf: createMethod(false)
    };
  }));
  var require_add_to_unscopables = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    module.exports = function() {
    };
  }));
  var require_es_array_includes = /* @__PURE__ */ __commonJSMin((() => {
    var $ = require_export();
    var $includes = require_array_includes().includes;
    var fails = require_fails();
    var addToUnscopables = require_add_to_unscopables();
    var BROKEN_ON_SPARSE = fails(function() {
      return !Array(1).includes();
    });
    var BROKEN_ON_SPARSE_WITH_FROM_INDEX = fails(function() {
      return [, 1].includes(void 0, 1);
    });
    $({
      target: "Array",
      proto: true,
      forced: BROKEN_ON_SPARSE || BROKEN_ON_SPARSE_WITH_FROM_INDEX
    }, { includes: function includes(el2) {
      return $includes(this, el2, arguments.length > 1 ? arguments[1] : void 0);
    } });
    addToUnscopables("includes");
  }));
  var require_get_built_in_prototype_method = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var globalThis2 = require_global_this();
    var path = require_path();
    module.exports = function(CONSTRUCTOR, METHOD) {
      var Namespace = path[CONSTRUCTOR + "Prototype"];
      var pureMethod = Namespace && Namespace[METHOD];
      if (pureMethod) return pureMethod;
      var NativeConstructor = globalThis2[CONSTRUCTOR];
      var NativePrototype = NativeConstructor && NativeConstructor.prototype;
      return NativePrototype && NativePrototype[METHOD];
    };
  }));
  var require_includes$3 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    require_es_array_includes();
    var getBuiltInPrototypeMethod = require_get_built_in_prototype_method();
    module.exports = getBuiltInPrototypeMethod("Array", "includes");
  }));
  var require_is_regexp = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var isObject = require_is_object();
    var classof = require_classof_raw();
    var MATCH = require_well_known_symbol()("match");
    module.exports = function(it) {
      var isRegExp;
      return isObject(it) && ((isRegExp = it[MATCH]) !== void 0 ? !!isRegExp : classof(it) === "RegExp");
    };
  }));
  var require_not_a_regexp = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var isRegExp = require_is_regexp();
    var $TypeError = TypeError;
    module.exports = function(it) {
      if (isRegExp(it)) throw new $TypeError("The method doesn't accept regular expressions");
      return it;
    };
  }));
  var require_to_string_tag_support = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var TO_STRING_TAG = require_well_known_symbol()("toStringTag");
    var test = {};
    test[TO_STRING_TAG] = "z";
    module.exports = String(test) === "[object z]";
  }));
  var require_classof = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var TO_STRING_TAG_SUPPORT = require_to_string_tag_support();
    var isCallable = require_is_callable();
    var classofRaw = require_classof_raw();
    var TO_STRING_TAG = require_well_known_symbol()("toStringTag");
    var $Object = Object;
    var CORRECT_ARGUMENTS = classofRaw(/* @__PURE__ */ (function() {
      return arguments;
    })()) === "Arguments";
    var tryGet = function(it, key) {
      try {
        return it[key];
      } catch (error) {
      }
    };
    module.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function(it) {
      var O, tag, result;
      return it === void 0 ? "Undefined" : it === null ? "Null" : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG)) == "string" ? tag : CORRECT_ARGUMENTS ? classofRaw(O) : (result = classofRaw(O)) === "Object" && isCallable(O.callee) ? "Arguments" : result;
    };
  }));
  var require_to_string = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var classof = require_classof();
    var $String = String;
    module.exports = function(argument) {
      if (classof(argument) === "Symbol") throw new TypeError("Cannot convert a Symbol value to a string");
      return $String(argument);
    };
  }));
  var require_correct_is_regexp_logic = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var MATCH = require_well_known_symbol()("match");
    module.exports = function(METHOD_NAME) {
      var regexp = /./;
      try {
        "/./"[METHOD_NAME](regexp);
      } catch (error1) {
        try {
          regexp[MATCH] = false;
          return "/./"[METHOD_NAME](regexp);
        } catch (error2) {
        }
      }
      return false;
    };
  }));
  var require_es_string_includes = /* @__PURE__ */ __commonJSMin((() => {
    var $ = require_export();
    var uncurryThis = require_function_uncurry_this();
    var notARegExp = require_not_a_regexp();
    var requireObjectCoercible = require_require_object_coercible();
    var toString = require_to_string();
    var correctIsRegExpLogic = require_correct_is_regexp_logic();
    var stringIndexOf = uncurryThis("".indexOf);
    $({
      target: "String",
      proto: true,
      forced: !correctIsRegExpLogic("includes")
    }, { includes: function includes(searchString) {
      return !!~stringIndexOf(toString(requireObjectCoercible(this)), toString(notARegExp(searchString)), arguments.length > 1 ? arguments[1] : void 0);
    } });
  }));
  var require_includes$2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    require_es_string_includes();
    var getBuiltInPrototypeMethod = require_get_built_in_prototype_method();
    module.exports = getBuiltInPrototypeMethod("String", "includes");
  }));
  var require_includes$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var isPrototypeOf = require_object_is_prototype_of();
    var arrayMethod = require_includes$3();
    var stringMethod = require_includes$2();
    var ArrayPrototype = Array.prototype;
    var StringPrototype = String.prototype;
    module.exports = function(it) {
      var own = it.includes;
      if (it === ArrayPrototype || isPrototypeOf(ArrayPrototype, it) && own === ArrayPrototype.includes) return arrayMethod;
      if (typeof it == "string" || it === StringPrototype || isPrototypeOf(StringPrototype, it) && own === StringPrototype.includes) return stringMethod;
      return own;
    };
  }));
  var require_includes = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    var parent = require_includes$1();
    module.exports = parent;
  }));
  var import_includes = /* @__PURE__ */ __toESM(require_includes(), 1);
  function map(array2, block) {
    let i;
    const il = array2.length;
    const result = [];
    for (i = 0; i < il; i++) result.push(block(array2[i]));
    return result;
  }
  function filter(array2, block) {
    let i;
    const il = array2.length;
    const result = [];
    for (i = 0; i < il; i++) if (block(array2[i])) result.push(array2[i]);
    return result;
  }
  function radians(d) {
    return d % 360 * Math.PI / 180;
  }
  function unCamelCase(s) {
    return s.replace(/([A-Z])/g, function(m, g) {
      return "-" + g.toLowerCase();
    });
  }
  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function proportionalSize(element, width2, height2, box) {
    if (width2 == null || height2 == null) {
      box = box || element.bbox();
      if (width2 == null) width2 = box.width / box.height * height2;
      else if (height2 == null) height2 = box.height / box.width * width2;
    }
    return {
      width: width2,
      height: height2
    };
  }
  function getOrigin(o, element) {
    const origin = o.origin;
    let ox = o.ox != null ? o.ox : o.originX != null ? o.originX : "center";
    let oy = o.oy != null ? o.oy : o.originY != null ? o.originY : "center";
    if (origin != null) [ox, oy] = Array.isArray(origin) ? origin : typeof origin === "object" ? [origin.x, origin.y] : [origin, origin];
    const condX = typeof ox === "string";
    const condY = typeof oy === "string";
    if (condX || condY) {
      const { height: height2, width: width2, x: x2, y: y2 } = element.bbox();
      if (condX) ox = (0, import_includes.default)(ox).call(ox, "left") ? x2 : (0, import_includes.default)(ox).call(ox, "right") ? x2 + width2 : x2 + width2 / 2;
      if (condY) oy = (0, import_includes.default)(oy).call(oy, "top") ? y2 : (0, import_includes.default)(oy).call(oy, "bottom") ? y2 + height2 : y2 + height2 / 2;
    }
    return [ox, oy];
  }
  var descriptiveElements = /* @__PURE__ */ new Set([
    "desc",
    "metadata",
    "title"
  ]);
  var isDescriptive = (element) => descriptiveElements.has(element.nodeName);
  var writeDataToDom = (element, data2, defaults = {}) => {
    const cloned = { ...data2 };
    for (const key in cloned) if (cloned[key].valueOf() === defaults[key]) delete cloned[key];
    if (Object.keys(cloned).length) element.node.setAttribute("data-svgjs", JSON.stringify(cloned));
    else {
      element.node.removeAttribute("data-svgjs");
      element.node.removeAttribute("svgjs:data");
    }
  };
  var svg = "http://www.w3.org/2000/svg";
  var html = "http://www.w3.org/1999/xhtml";
  var xmlns = "http://www.w3.org/2000/xmlns/";
  var xlink = "http://www.w3.org/1999/xlink";
  var globals = {
    window: typeof window === "undefined" ? null : window,
    document: typeof document === "undefined" ? null : document
  };
  function getWindow() {
    return globals.window;
  }
  var Base = class {
  };
  var elements = {};
  var root = "___SYMBOL___ROOT___";
  function create(name, ns = svg) {
    return globals.document.createElementNS(ns, name);
  }
  function makeInstance(element, isHTML = false) {
    if (element instanceof Base) return element;
    if (typeof element === "object") return adopter(element);
    if (element == null) return new elements[root]();
    if (typeof element === "string" && element.trim().charAt(0) !== "<") return adopter(globals.document.querySelector(element));
    const wrapper = isHTML ? globals.document.createElement("div") : create("svg");
    wrapper.innerHTML = element.trim();
    element = adopter(wrapper.firstElementChild);
    wrapper.removeChild(wrapper.firstElementChild);
    return element;
  }
  function nodeOrNew(name, node) {
    return node && (node instanceof globals.window.Node || node.ownerDocument && node instanceof node.ownerDocument.defaultView.Node) ? node : create(name);
  }
  function adopt(node) {
    if (!node) return null;
    if (node.instance instanceof Base) return node.instance;
    if (node.nodeName === "#document-fragment") return new elements.Fragment(node);
    let className = capitalize(node.nodeName || "Dom");
    if (className === "LinearGradient" || className === "RadialGradient") className = "Gradient";
    else if (!elements[className]) className = "Dom";
    return new elements[className](node);
  }
  var adopter = adopt;
  function register(element, name = element.name, asRoot = false) {
    elements[name] = element;
    if (asRoot) elements[root] = element;
    addMethodNames(Object.getOwnPropertyNames(element.prototype));
    return element;
  }
  function getClass(name) {
    return elements[name];
  }
  var did = 1e3;
  function eid(name) {
    return "Svgjs" + capitalize(name) + did++;
  }
  function assignNewId(node) {
    for (let i = node.children.length - 1; i >= 0; i--) assignNewId(node.children[i]);
    if (node.id) {
      node.id = eid(node.nodeName);
      return node;
    }
    return node;
  }
  function extend(modules, methods2) {
    let key, i;
    modules = Array.isArray(modules) ? modules : [modules];
    for (i = modules.length - 1; i >= 0; i--) for (key in methods2) modules[i].prototype[key] = methods2[key];
  }
  function wrapWithAttrCheck(fn) {
    return function(...args) {
      const o = args[args.length - 1];
      if (o && o.constructor === Object && !(o instanceof Array)) return fn.apply(this, args.slice(0, -1)).attr(o);
      else return fn.apply(this, args);
    };
  }
  function siblings() {
    return this.parent().children();
  }
  function position() {
    return this.parent().index(this);
  }
  function next() {
    return this.siblings()[this.position() + 1];
  }
  function prev() {
    return this.siblings()[this.position() - 1];
  }
  function forward() {
    const i = this.position();
    this.parent().add(this.remove(), i + 1);
    return this;
  }
  function backward() {
    const i = this.position();
    this.parent().add(this.remove(), i ? i - 1 : 0);
    return this;
  }
  function front() {
    this.parent().add(this.remove());
    return this;
  }
  function back() {
    this.parent().add(this.remove(), 0);
    return this;
  }
  function before(element) {
    element = makeInstance(element);
    element.remove();
    const i = this.position();
    this.parent().add(element, i);
    return this;
  }
  function after(element) {
    element = makeInstance(element);
    element.remove();
    const i = this.position();
    this.parent().add(element, i + 1);
    return this;
  }
  function insertBefore(element) {
    element = makeInstance(element);
    element.before(this);
    return this;
  }
  function insertAfter(element) {
    element = makeInstance(element);
    element.after(this);
    return this;
  }
  registerMethods("Dom", {
    siblings,
    position,
    next,
    prev,
    forward,
    backward,
    front,
    back,
    before,
    after,
    insertBefore,
    insertAfter
  });
  var numberAndUnit = /^([+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?)([a-z%]*)$/i;
  var hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
  var rgb = /rgb\((\d+),(\d+),(\d+)\)/;
  var reference = /^(#[^\s]+)$/;
  var transforms = /\)\s*,?\s*/;
  var whitespace = /\s/g;
  var isHex = /^#[a-f0-9]{3}$|^#[a-f0-9]{6}$/i;
  var isRgb = /^rgb\(/;
  var isBlank = /^(\s+)?$/;
  var isNumber = /^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
  var isImage = /\.(jpg|jpeg|png|gif|svg)(\?[^=]+.*)?/i;
  var delimiter = /[\s,]+/;
  var isPathLetter = /[MLHVCSQTAZ]/i;
  function classes() {
    const attr2 = this.attr("class");
    return attr2 == null ? [] : attr2.trim().split(delimiter);
  }
  function hasClass(name) {
    return this.classes().indexOf(name) !== -1;
  }
  function addClass(name) {
    if (!this.hasClass(name)) {
      const array2 = this.classes();
      array2.push(name);
      this.attr("class", array2.join(" "));
    }
    return this;
  }
  function removeClass(name) {
    if (this.hasClass(name)) this.attr("class", this.classes().filter(function(c) {
      return c !== name;
    }).join(" "));
    return this;
  }
  function toggleClass(name) {
    return this.hasClass(name) ? this.removeClass(name) : this.addClass(name);
  }
  registerMethods("Dom", {
    classes,
    hasClass,
    addClass,
    removeClass,
    toggleClass
  });
  var cssName = (name) => name.startsWith("--") ? name : unCamelCase(name);
  function css(style, val) {
    const ret = {};
    if (arguments.length === 0) {
      const declaration = this.node.style;
      for (let i = 0; i < declaration.length; i++) {
        const name = declaration.item(i);
        const value = declaration.getPropertyValue(name);
        const priority = declaration.getPropertyPriority(name);
        ret[name] = priority ? `${value} !${priority}` : value;
      }
      return ret;
    }
    if (arguments.length < 2) {
      if (Array.isArray(style)) {
        for (const name of style) {
          const cased = cssName(name);
          ret[name] = this.node.style.getPropertyValue(cased);
        }
        return ret;
      }
      if (typeof style === "string") return this.node.style.getPropertyValue(cssName(style));
      if (typeof style === "object") for (const name in style) this.node.style.setProperty(cssName(name), style[name] == null || isBlank.test(style[name]) ? "" : style[name]);
    }
    if (arguments.length === 2) this.node.style.setProperty(cssName(style), val == null || isBlank.test(val) ? "" : val);
    return this;
  }
  function show() {
    return this.css("display", "");
  }
  function hide() {
    return this.css("display", "none");
  }
  function visible() {
    return this.css("display") !== "none";
  }
  registerMethods("Dom", {
    css,
    show,
    hide,
    visible
  });
  function data(a, v, r) {
    if (a == null) return this.data(map(filter(this.node.attributes, (el2) => el2.nodeName.indexOf("data-") === 0), (el2) => el2.nodeName.slice(5)));
    else if (a instanceof Array) {
      const data2 = {};
      for (const key of a) data2[key] = this.data(key);
      return data2;
    } else if (typeof a === "object") for (v in a) this.data(v, a[v]);
    else if (arguments.length < 2) try {
      return JSON.parse(this.attr("data-" + a));
    } catch (e) {
      return this.attr("data-" + a);
    }
    else this.attr("data-" + a, v === null ? null : r === true || typeof v === "string" || typeof v === "number" ? v : JSON.stringify(v));
    return this;
  }
  registerMethods("Dom", { data });
  function remember(k, v) {
    if (typeof arguments[0] === "object") for (const key in k) this.remember(key, k[key]);
    else if (arguments.length === 1) return this.memory()[k];
    else this.memory()[k] = v;
    return this;
  }
  function forget() {
    if (arguments.length === 0) this._memory = {};
    else for (let i = arguments.length - 1; i >= 0; i--) delete this.memory()[arguments[i]];
    return this;
  }
  function memory() {
    return this._memory = this._memory || {};
  }
  registerMethods("Dom", {
    remember,
    forget,
    memory
  });
  function sixDigitHex(hex2) {
    return hex2.length === 4 ? [
      "#",
      hex2.substring(1, 2),
      hex2.substring(1, 2),
      hex2.substring(2, 3),
      hex2.substring(2, 3),
      hex2.substring(3, 4),
      hex2.substring(3, 4)
    ].join("") : hex2;
  }
  function componentHex(component) {
    const hex2 = Math.max(0, Math.min(255, Math.round(component))).toString(16);
    return hex2.length === 1 ? "0" + hex2 : hex2;
  }
  function is(object, space) {
    for (let i = space.length; i--; ) if (object[space[i]] == null) return false;
    return true;
  }
  function getParameters(a, b) {
    const params = is(a, "rgb") ? {
      _a: a.r,
      _b: a.g,
      _c: a.b,
      _d: 0,
      space: "rgb"
    } : is(a, "xyz") ? {
      _a: a.x,
      _b: a.y,
      _c: a.z,
      _d: 0,
      space: "xyz"
    } : is(a, "hsl") ? {
      _a: a.h,
      _b: a.s,
      _c: a.l,
      _d: 0,
      space: "hsl"
    } : is(a, "lab") ? {
      _a: a.l,
      _b: a.a,
      _c: a.b,
      _d: 0,
      space: "lab"
    } : is(a, "lch") ? {
      _a: a.l,
      _b: a.c,
      _c: a.h,
      _d: 0,
      space: "lch"
    } : is(a, "cmyk") ? {
      _a: a.c,
      _b: a.m,
      _c: a.y,
      _d: a.k,
      space: "cmyk"
    } : {
      _a: 0,
      _b: 0,
      _c: 0,
      space: "rgb"
    };
    params.space = b || params.space;
    return params;
  }
  function cieSpace(space) {
    if (space === "lab" || space === "xyz" || space === "lch") return true;
    else return false;
  }
  function hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  var Color = class Color2 {
    constructor(...inputs) {
      this.init(...inputs);
    }
    static isColor(color) {
      return color && (color instanceof Color2 || this.isRgb(color) || this.test(color));
    }
    static isRgb(color) {
      return color && typeof color.r === "number" && typeof color.g === "number" && typeof color.b === "number";
    }
    static random(mode = "vibrant", t) {
      const { random, round, sin, PI: pi } = Math;
      if (mode === "vibrant") {
        const l = 24 * random() + 57;
        const c = 38 * random() + 45;
        const h = 360 * random();
        return new Color2(l, c, h, "lch");
      } else if (mode === "sine") {
        t = t == null ? random() : t;
        const r = round(80 * sin(2 * pi * t / 0.5 + 0.01) + 150);
        const g = round(50 * sin(2 * pi * t / 0.5 + 4.6) + 200);
        const b = round(100 * sin(2 * pi * t / 0.5 + 2.3) + 150);
        return new Color2(r, g, b);
      } else if (mode === "pastel") {
        const l = 8 * random() + 86;
        const c = 17 * random() + 9;
        const h = 360 * random();
        return new Color2(l, c, h, "lch");
      } else if (mode === "dark") {
        const l = 10 + 10 * random();
        const c = 50 * random() + 86;
        const h = 360 * random();
        return new Color2(l, c, h, "lch");
      } else if (mode === "rgb") {
        const r = 255 * random();
        const g = 255 * random();
        const b = 255 * random();
        return new Color2(r, g, b);
      } else if (mode === "lab") {
        const l = 100 * random();
        const a = 256 * random() - 128;
        const b = 256 * random() - 128;
        return new Color2(l, a, b, "lab");
      } else if (mode === "grey") {
        const grey = 255 * random();
        return new Color2(grey, grey, grey);
      } else throw new Error("Unsupported random color mode");
    }
    static test(color) {
      return typeof color === "string" && (isHex.test(color) || isRgb.test(color));
    }
    cmyk() {
      const { _a, _b, _c } = this.rgb();
      const [r, g, b] = [
        _a,
        _b,
        _c
      ].map((v) => v / 255);
      const k = Math.min(1 - r, 1 - g, 1 - b);
      if (k === 1) return new Color2(0, 0, 0, 1, "cmyk");
      const c = (1 - r - k) / (1 - k);
      const m = (1 - g - k) / (1 - k);
      const y2 = (1 - b - k) / (1 - k);
      return new Color2(c, m, y2, k, "cmyk");
    }
    hsl() {
      const { _a, _b, _c } = this.rgb();
      const [r, g, b] = [
        _a,
        _b,
        _c
      ].map((v) => v / 255);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      const isGrey = max === min;
      const delta = max - min;
      const s = isGrey ? 0 : l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      const h = isGrey ? 0 : max === r ? ((g - b) / delta + (g < b ? 6 : 0)) / 6 : max === g ? ((b - r) / delta + 2) / 6 : max === b ? ((r - g) / delta + 4) / 6 : 0;
      return new Color2(360 * h, 100 * s, 100 * l, "hsl");
    }
    init(a = 0, b = 0, c = 0, d = 0, space = "rgb") {
      a = !a ? 0 : a;
      if (this.space) for (const component in this.space) delete this[this.space[component]];
      if (typeof a === "number") {
        space = typeof d === "string" ? d : space;
        d = typeof d === "string" ? 0 : d;
        Object.assign(this, {
          _a: a,
          _b: b,
          _c: c,
          _d: d,
          space
        });
      } else if (a instanceof Array) {
        this.space = b || (typeof a[3] === "string" ? a[3] : a[4]) || "rgb";
        Object.assign(this, {
          _a: a[0],
          _b: a[1],
          _c: a[2],
          _d: a[3] || 0
        });
      } else if (a instanceof Object) {
        const values = getParameters(a, b);
        Object.assign(this, values);
      } else if (typeof a === "string") if (isRgb.test(a)) {
        const noWhitespace = a.replace(whitespace, "");
        const [_a2, _b2, _c2] = rgb.exec(noWhitespace).slice(1, 4).map((v) => parseInt(v));
        Object.assign(this, {
          _a: _a2,
          _b: _b2,
          _c: _c2,
          _d: 0,
          space: "rgb"
        });
      } else if (isHex.test(a)) {
        const hexParse = (v) => parseInt(v, 16);
        const [, _a2, _b2, _c2] = hex.exec(sixDigitHex(a)).map(hexParse);
        Object.assign(this, {
          _a: _a2,
          _b: _b2,
          _c: _c2,
          _d: 0,
          space: "rgb"
        });
      } else throw Error("Unsupported string format, can't construct Color");
      const { _a, _b, _c, _d } = this;
      const components = this.space === "rgb" ? {
        r: _a,
        g: _b,
        b: _c
      } : this.space === "xyz" ? {
        x: _a,
        y: _b,
        z: _c
      } : this.space === "hsl" ? {
        h: _a,
        s: _b,
        l: _c
      } : this.space === "lab" ? {
        l: _a,
        a: _b,
        b: _c
      } : this.space === "lch" ? {
        l: _a,
        c: _b,
        h: _c
      } : this.space === "cmyk" ? {
        c: _a,
        m: _b,
        y: _c,
        k: _d
      } : {};
      Object.assign(this, components);
    }
    lab() {
      const { x: x2, y: y2, z } = this.xyz();
      const l = 116 * y2 - 16;
      const a = 500 * (x2 - y2);
      const b = 200 * (y2 - z);
      return new Color2(l, a, b, "lab");
    }
    lch() {
      const { l, a, b } = this.lab();
      const c = Math.sqrt(a ** 2 + b ** 2);
      let h = 180 * Math.atan2(b, a) / Math.PI;
      if (h < 0) {
        h *= -1;
        h = 360 - h;
      }
      return new Color2(l, c, h, "lch");
    }
    rgb() {
      if (this.space === "rgb") return this;
      else if (cieSpace(this.space)) {
        let { x: x2, y: y2, z } = this;
        if (this.space === "lab" || this.space === "lch") {
          let { l, a, b: b2 } = this;
          if (this.space === "lch") {
            const { c, h } = this;
            const dToR = Math.PI / 180;
            a = c * Math.cos(dToR * h);
            b2 = c * Math.sin(dToR * h);
          }
          const yL = (l + 16) / 116;
          const xL = a / 500 + yL;
          const zL = yL - b2 / 200;
          const ct = 16 / 116;
          const mx = 8856e-6;
          const nm = 7.787;
          x2 = 0.95047 * (xL ** 3 > mx ? xL ** 3 : (xL - ct) / nm);
          y2 = 1 * (yL ** 3 > mx ? yL ** 3 : (yL - ct) / nm);
          z = 1.08883 * (zL ** 3 > mx ? zL ** 3 : (zL - ct) / nm);
        }
        const rU = x2 * 3.2406 + y2 * -1.5372 + z * -0.4986;
        const gU = x2 * -0.9689 + y2 * 1.8758 + z * 0.0415;
        const bU = x2 * 0.0557 + y2 * -0.204 + z * 1.057;
        const pow = Math.pow;
        const bd = 31308e-7;
        const r = rU > bd ? 1.055 * pow(rU, 1 / 2.4) - 0.055 : 12.92 * rU;
        const g = gU > bd ? 1.055 * pow(gU, 1 / 2.4) - 0.055 : 12.92 * gU;
        const b = bU > bd ? 1.055 * pow(bU, 1 / 2.4) - 0.055 : 12.92 * bU;
        return new Color2(255 * r, 255 * g, 255 * b);
      } else if (this.space === "hsl") {
        let { h, s, l } = this;
        h /= 360;
        s /= 100;
        l /= 100;
        if (s === 0) {
          l *= 255;
          return new Color2(l, l, l);
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const r = 255 * hueToRgb(p, q, h + 1 / 3);
        const g = 255 * hueToRgb(p, q, h);
        const b = 255 * hueToRgb(p, q, h - 1 / 3);
        return new Color2(r, g, b);
      } else if (this.space === "cmyk") {
        const { c, m, y: y2, k } = this;
        const r = 255 * (1 - Math.min(1, c * (1 - k) + k));
        const g = 255 * (1 - Math.min(1, m * (1 - k) + k));
        const b = 255 * (1 - Math.min(1, y2 * (1 - k) + k));
        return new Color2(r, g, b);
      } else return this;
    }
    toArray() {
      const { _a, _b, _c, _d, space } = this;
      return [
        _a,
        _b,
        _c,
        _d,
        space
      ];
    }
    toHex() {
      const [r, g, b] = this._clamped().map(componentHex);
      return `#${r}${g}${b}`;
    }
    toRgb() {
      const [rV, gV, bV] = this._clamped();
      return `rgb(${rV},${gV},${bV})`;
    }
    toString() {
      return this.toHex();
    }
    xyz() {
      const { _a: r255, _b: g255, _c: b255 } = this.rgb();
      const [r, g, b] = [
        r255,
        g255,
        b255
      ].map((v) => v / 255);
      const rL = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
      const gL = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
      const bL = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
      const xU = (rL * 0.4124 + gL * 0.3576 + bL * 0.1805) / 0.95047;
      const yU = (rL * 0.2126 + gL * 0.7152 + bL * 0.0722) / 1;
      const zU = (rL * 0.0193 + gL * 0.1192 + bL * 0.9505) / 1.08883;
      const x2 = xU > 8856e-6 ? Math.pow(xU, 1 / 3) : 7.787 * xU + 16 / 116;
      const y2 = yU > 8856e-6 ? Math.pow(yU, 1 / 3) : 7.787 * yU + 16 / 116;
      const z = zU > 8856e-6 ? Math.pow(zU, 1 / 3) : 7.787 * zU + 16 / 116;
      return new Color2(x2, y2, z, "xyz");
    }
    _clamped() {
      const { _a, _b, _c } = this.rgb();
      const { max, min, round } = Math;
      const format = (v) => max(0, min(round(v), 255));
      return [
        _a,
        _b,
        _c
      ].map(format);
    }
  };
  var Point = class Point2 {
    constructor(...args) {
      this.init(...args);
    }
    clone() {
      return new Point2(this);
    }
    init(x2, y2) {
      const base = {
        x: 0,
        y: 0
      };
      const source = Array.isArray(x2) ? {
        x: x2[0],
        y: x2[1]
      } : typeof x2 === "object" ? {
        x: x2.x,
        y: x2.y
      } : {
        x: x2,
        y: y2
      };
      this.x = source.x == null ? base.x : source.x;
      this.y = source.y == null ? base.y : source.y;
      return this;
    }
    toArray() {
      return [this.x, this.y];
    }
    transform(m) {
      return this.clone().transformO(m);
    }
    transformO(m) {
      if (!Matrix.isMatrixLike(m)) m = new Matrix(m);
      const { x: x2, y: y2 } = this;
      this.x = m.a * x2 + m.c * y2 + m.e;
      this.y = m.b * x2 + m.d * y2 + m.f;
      return this;
    }
  };
  function point(x2, y2) {
    return new Point(x2, y2).transformO(this.screenCTM().inverseO());
  }
  function closeEnough(a, b, threshold) {
    return Math.abs(b - a) < (threshold || 1e-6);
  }
  var Matrix = class Matrix2 {
    constructor(...args) {
      this.init(...args);
    }
    static formatTransforms(o) {
      const flipBoth = o.flip === "both" || o.flip === true;
      const flipX = o.flip && (flipBoth || o.flip === "x") ? -1 : 1;
      const flipY = o.flip && (flipBoth || o.flip === "y") ? -1 : 1;
      const skewX = o.skew && o.skew.length ? o.skew[0] : isFinite(o.skew) ? o.skew : isFinite(o.skewX) ? o.skewX : 0;
      const skewY = o.skew && o.skew.length ? o.skew[1] : isFinite(o.skew) ? o.skew : isFinite(o.skewY) ? o.skewY : 0;
      const scaleX = o.scale && o.scale.length ? o.scale[0] * flipX : isFinite(o.scale) ? o.scale * flipX : isFinite(o.scaleX) ? o.scaleX * flipX : flipX;
      const scaleY = o.scale && o.scale.length ? o.scale[1] * flipY : isFinite(o.scale) ? o.scale * flipY : isFinite(o.scaleY) ? o.scaleY * flipY : flipY;
      const shear = o.shear || 0;
      const theta = o.rotate || o.theta || 0;
      const origin = new Point(o.origin || o.around || o.ox || o.originX, o.oy || o.originY);
      const ox = origin.x;
      const oy = origin.y;
      const position2 = new Point(o.position ?? o.px ?? o.positionX ?? NaN, o.py ?? o.positionY ?? NaN);
      const px = position2.x;
      const py = position2.y;
      const translate = new Point(o.translate || o.tx || o.translateX, o.ty || o.translateY);
      const tx = translate.x;
      const ty = translate.y;
      const relative = new Point(o.relative || o.rx || o.relativeX, o.ry || o.relativeY);
      return {
        scaleX,
        scaleY,
        skewX,
        skewY,
        shear,
        theta,
        rx: relative.x,
        ry: relative.y,
        tx,
        ty,
        ox,
        oy,
        px,
        py
      };
    }
    static fromArray(a) {
      return {
        a: a[0],
        b: a[1],
        c: a[2],
        d: a[3],
        e: a[4],
        f: a[5]
      };
    }
    static isMatrixLike(o) {
      return o.a != null || o.b != null || o.c != null || o.d != null || o.e != null || o.f != null;
    }
    static matrixMultiply(l, r, o) {
      const a = l.a * r.a + l.c * r.b;
      const b = l.b * r.a + l.d * r.b;
      const c = l.a * r.c + l.c * r.d;
      const d = l.b * r.c + l.d * r.d;
      const e = l.e + l.a * r.e + l.c * r.f;
      const f = l.f + l.b * r.e + l.d * r.f;
      o.a = a;
      o.b = b;
      o.c = c;
      o.d = d;
      o.e = e;
      o.f = f;
      return o;
    }
    around(cx2, cy2, matrix) {
      return this.clone().aroundO(cx2, cy2, matrix);
    }
    aroundO(cx2, cy2, matrix) {
      const dx2 = cx2 || 0;
      const dy2 = cy2 || 0;
      return this.translateO(-dx2, -dy2).lmultiplyO(matrix).translateO(dx2, dy2);
    }
    clone() {
      return new Matrix2(this);
    }
    decompose(cx2 = 0, cy2 = 0) {
      const a = this.a;
      const b = this.b;
      const c = this.c;
      const d = this.d;
      const e = this.e;
      const f = this.f;
      const determinant = a * d - b * c;
      const ccw = determinant > 0 ? 1 : -1;
      const sx = ccw * Math.sqrt(a * a + b * b);
      const thetaRad = Math.atan2(ccw * b, ccw * a);
      const theta = 180 / Math.PI * thetaRad;
      const lam = (a * c + b * d) / determinant;
      return {
        scaleX: sx,
        scaleY: c * sx / (lam * a - b) || d * sx / (lam * b + a),
        shear: lam,
        rotate: theta,
        translateX: e - cx2 + cx2 * a + cy2 * c,
        translateY: f - cy2 + cx2 * b + cy2 * d,
        originX: cx2,
        originY: cy2,
        a: this.a,
        b: this.b,
        c: this.c,
        d: this.d,
        e: this.e,
        f: this.f
      };
    }
    equals(other) {
      if (other === this) return true;
      const comp = new Matrix2(other);
      return closeEnough(this.a, comp.a) && closeEnough(this.b, comp.b) && closeEnough(this.c, comp.c) && closeEnough(this.d, comp.d) && closeEnough(this.e, comp.e) && closeEnough(this.f, comp.f);
    }
    flip(axis, around) {
      return this.clone().flipO(axis, around);
    }
    flipO(axis, around) {
      return axis === "x" ? this.scaleO(-1, 1, around, 0) : axis === "y" ? this.scaleO(1, -1, 0, around) : this.scaleO(-1, -1, axis, around || axis);
    }
    init(source) {
      const base = Matrix2.fromArray([
        1,
        0,
        0,
        1,
        0,
        0
      ]);
      source = source instanceof Element ? source.matrixify() : typeof source === "string" ? Matrix2.fromArray(source.split(delimiter).map(parseFloat)) : Array.isArray(source) ? Matrix2.fromArray(source) : typeof source === "object" && Matrix2.isMatrixLike(source) ? source : typeof source === "object" ? new Matrix2().transform(source) : arguments.length === 6 ? Matrix2.fromArray([].slice.call(arguments)) : base;
      this.a = source.a != null ? source.a : base.a;
      this.b = source.b != null ? source.b : base.b;
      this.c = source.c != null ? source.c : base.c;
      this.d = source.d != null ? source.d : base.d;
      this.e = source.e != null ? source.e : base.e;
      this.f = source.f != null ? source.f : base.f;
      return this;
    }
    inverse() {
      return this.clone().inverseO();
    }
    inverseO() {
      const a = this.a;
      const b = this.b;
      const c = this.c;
      const d = this.d;
      const e = this.e;
      const f = this.f;
      const det = a * d - b * c;
      if (!det) throw new Error("Cannot invert " + this);
      const na = d / det;
      const nb = -b / det;
      const nc = -c / det;
      const nd = a / det;
      const ne = -(na * e + nc * f);
      const nf = -(nb * e + nd * f);
      this.a = na;
      this.b = nb;
      this.c = nc;
      this.d = nd;
      this.e = ne;
      this.f = nf;
      return this;
    }
    lmultiply(matrix) {
      return this.clone().lmultiplyO(matrix);
    }
    lmultiplyO(matrix) {
      const r = this;
      const l = matrix instanceof Matrix2 ? matrix : new Matrix2(matrix);
      return Matrix2.matrixMultiply(l, r, this);
    }
    multiply(matrix) {
      return this.clone().multiplyO(matrix);
    }
    multiplyO(matrix) {
      const l = this;
      const r = matrix instanceof Matrix2 ? matrix : new Matrix2(matrix);
      return Matrix2.matrixMultiply(l, r, this);
    }
    rotate(r, cx2, cy2) {
      return this.clone().rotateO(r, cx2, cy2);
    }
    rotateO(r, cx2 = 0, cy2 = 0) {
      r = radians(r);
      const cos = Math.cos(r);
      const sin = Math.sin(r);
      const { a, b, c, d, e, f } = this;
      this.a = a * cos - b * sin;
      this.b = b * cos + a * sin;
      this.c = c * cos - d * sin;
      this.d = d * cos + c * sin;
      this.e = e * cos - f * sin + cy2 * sin - cx2 * cos + cx2;
      this.f = f * cos + e * sin - cx2 * sin - cy2 * cos + cy2;
      return this;
    }
    scale() {
      return this.clone().scaleO(...arguments);
    }
    scaleO(x2, y2 = x2, cx2 = 0, cy2 = 0) {
      if (arguments.length === 3) {
        cy2 = cx2;
        cx2 = y2;
        y2 = x2;
      }
      const { a, b, c, d, e, f } = this;
      this.a = a * x2;
      this.b = b * y2;
      this.c = c * x2;
      this.d = d * y2;
      this.e = e * x2 - cx2 * x2 + cx2;
      this.f = f * y2 - cy2 * y2 + cy2;
      return this;
    }
    shear(a, cx2, cy2) {
      return this.clone().shearO(a, cx2, cy2);
    }
    shearO(lx, cx2 = 0, cy2 = 0) {
      const { a, b, c, d, e, f } = this;
      this.a = a + b * lx;
      this.c = c + d * lx;
      this.e = e + f * lx - cy2 * lx;
      return this;
    }
    skew() {
      return this.clone().skewO(...arguments);
    }
    skewO(x2, y2 = x2, cx2 = 0, cy2 = 0) {
      if (arguments.length === 3) {
        cy2 = cx2;
        cx2 = y2;
        y2 = x2;
      }
      x2 = radians(x2);
      y2 = radians(y2);
      const lx = Math.tan(x2);
      const ly = Math.tan(y2);
      const { a, b, c, d, e, f } = this;
      this.a = a + b * lx;
      this.b = b + a * ly;
      this.c = c + d * lx;
      this.d = d + c * ly;
      this.e = e + f * lx - cy2 * lx;
      this.f = f + e * ly - cx2 * ly;
      return this;
    }
    skewX(x2, cx2, cy2) {
      return this.skew(x2, 0, cx2, cy2);
    }
    skewY(y2, cx2, cy2) {
      return this.skew(0, y2, cx2, cy2);
    }
    toArray() {
      return [
        this.a,
        this.b,
        this.c,
        this.d,
        this.e,
        this.f
      ];
    }
    toString() {
      return "matrix(" + this.a + "," + this.b + "," + this.c + "," + this.d + "," + this.e + "," + this.f + ")";
    }
    transform(o) {
      if (Matrix2.isMatrixLike(o)) return new Matrix2(o).multiplyO(this);
      const t = Matrix2.formatTransforms(o);
      const current = this;
      const { x: ox, y: oy } = new Point(t.ox, t.oy).transform(current);
      const transformer = new Matrix2().translateO(t.rx, t.ry).lmultiplyO(current).translateO(-ox, -oy).scaleO(t.scaleX, t.scaleY).skewO(t.skewX, t.skewY).shearO(t.shear).rotateO(t.theta).translateO(ox, oy);
      if (isFinite(t.px) || isFinite(t.py)) {
        const origin = new Point(ox, oy).transform(transformer);
        const dx2 = isFinite(t.px) ? t.px - origin.x : 0;
        const dy2 = isFinite(t.py) ? t.py - origin.y : 0;
        transformer.translateO(dx2, dy2);
      }
      transformer.translateO(t.tx, t.ty);
      return transformer;
    }
    translate(x2, y2) {
      return this.clone().translateO(x2, y2);
    }
    translateO(x2, y2) {
      this.e += x2 || 0;
      this.f += y2 || 0;
      return this;
    }
    valueOf() {
      return {
        a: this.a,
        b: this.b,
        c: this.c,
        d: this.d,
        e: this.e,
        f: this.f
      };
    }
  };
  function ctm() {
    return new Matrix(this.node.getCTM());
  }
  function screenCTM() {
    try {
      if (typeof this.isRoot === "function" && !this.isRoot()) {
        const rect = this.rect(1, 1);
        const m = rect.node.getScreenCTM();
        rect.remove();
        return new Matrix(m);
      }
      return new Matrix(this.node.getScreenCTM());
    } catch (e) {
      console.warn(`Cannot get CTM from SVG node ${this.node.nodeName}. Is the element rendered?`);
      return new Matrix();
    }
  }
  register(Matrix, "Matrix");
  function parser() {
    if (!parser.nodes || parser.nodes.svg.node.ownerDocument !== globals.document) {
      const svg2 = makeInstance().size(2, 0);
      svg2.node.style.cssText = [
        "opacity: 0",
        "position: absolute",
        "left: -100%",
        "top: -100%",
        "overflow: hidden"
      ].join(";");
      svg2.attr("focusable", "false");
      svg2.attr("aria-hidden", "true");
      parser.nodes = {
        svg: svg2,
        path: svg2.path().node
      };
    }
    if (!parser.nodes.svg.node.parentNode) parser.nodes.svg.addTo(globals.document.body || globals.document.documentElement);
    return parser.nodes;
  }
  function isNulledBox(box) {
    return !box.width && !box.height && !box.x && !box.y;
  }
  function domContains(node) {
    return node === globals.document || (globals.document.documentElement.contains || function(node2) {
      while (node2.parentNode) node2 = node2.parentNode;
      return node2 === globals.document;
    }).call(globals.document.documentElement, node);
  }
  var Box = class Box2 {
    constructor(...args) {
      this.init(...args);
    }
    addOffset() {
      this.x += globals.window.pageXOffset;
      this.y += globals.window.pageYOffset;
      return new Box2(this);
    }
    init(source) {
      source = typeof source === "string" ? source.split(delimiter).map(parseFloat) : Array.isArray(source) ? source : typeof source === "object" ? [
        source.left != null ? source.left : source.x,
        source.top != null ? source.top : source.y,
        source.width,
        source.height
      ] : arguments.length === 4 ? [].slice.call(arguments) : [
        0,
        0,
        0,
        0
      ];
      this.x = source[0] || 0;
      this.y = source[1] || 0;
      this.width = this.w = source[2] || 0;
      this.height = this.h = source[3] || 0;
      this.x2 = this.x + this.w;
      this.y2 = this.y + this.h;
      this.cx = this.x + this.w / 2;
      this.cy = this.y + this.h / 2;
      return this;
    }
    isNulled() {
      return isNulledBox(this);
    }
    merge(box) {
      const x2 = Math.min(this.x, box.x);
      const y2 = Math.min(this.y, box.y);
      const width2 = Math.max(this.x + this.width, box.x + box.width) - x2;
      const height2 = Math.max(this.y + this.height, box.y + box.height) - y2;
      return new Box2(x2, y2, width2, height2);
    }
    toArray() {
      return [
        this.x,
        this.y,
        this.width,
        this.height
      ];
    }
    toString() {
      return this.x + " " + this.y + " " + this.width + " " + this.height;
    }
    transform(m) {
      if (!(m instanceof Matrix)) m = new Matrix(m);
      let xMin = Infinity;
      let xMax = -Infinity;
      let yMin = Infinity;
      let yMax = -Infinity;
      [
        new Point(this.x, this.y),
        new Point(this.x2, this.y),
        new Point(this.x, this.y2),
        new Point(this.x2, this.y2)
      ].forEach(function(p) {
        p = p.transform(m);
        xMin = Math.min(xMin, p.x);
        xMax = Math.max(xMax, p.x);
        yMin = Math.min(yMin, p.y);
        yMax = Math.max(yMax, p.y);
      });
      return new Box2(xMin, yMin, xMax - xMin, yMax - yMin);
    }
  };
  function getBox(el2, getBBoxFn, retry) {
    let box;
    try {
      box = getBBoxFn(el2.node);
      if (isNulledBox(box) && !domContains(el2.node)) throw new Error("Element not in the dom");
    } catch (e) {
      box = retry(el2);
    }
    return box;
  }
  function bbox() {
    const getBBox = (node) => node.getBBox();
    const retry = (el2) => {
      try {
        const clone = el2.clone().addTo(parser().svg).show();
        const box2 = clone.node.getBBox();
        clone.remove();
        return box2;
      } catch (e) {
        throw new Error(`Getting bbox of element "${el2.node.nodeName}" is not possible: ${e.toString()}`);
      }
    };
    const box = getBox(this, getBBox, retry);
    return new Box(box);
  }
  function rbox(el2) {
    const getRBox = (node) => node.getBoundingClientRect();
    const retry = (el3) => {
      throw new Error(`Getting rbox of element "${el3.node.nodeName}" is not possible`);
    };
    const box = getBox(this, getRBox, retry);
    const rbox2 = new Box(box);
    if (el2) return rbox2.transform(el2.screenCTM().inverseO());
    return rbox2.addOffset();
  }
  function inside(x2, y2) {
    const box = this.bbox();
    return x2 > box.x && y2 > box.y && x2 < box.x + box.width && y2 < box.y + box.height;
  }
  registerMethods({ viewbox: {
    viewbox(x2, y2, width2, height2) {
      if (x2 == null) return new Box(this.attr("viewBox"));
      return this.attr("viewBox", new Box(x2, y2, width2, height2));
    },
    zoom(level, point2) {
      let { width: width2, height: height2 } = this.attr(["width", "height"]);
      if (!width2 && !height2 || typeof width2 === "string" || typeof height2 === "string") {
        width2 = this.node.clientWidth;
        height2 = this.node.clientHeight;
      }
      if (!width2 || !height2) throw new Error("Impossible to get absolute width and height. Please provide an absolute width and height attribute on the zooming element");
      const v = this.viewbox();
      const zoomX = width2 / v.width;
      const zoomY = height2 / v.height;
      const zoom = Math.min(zoomX, zoomY);
      if (level == null) return zoom;
      let zoomAmount = zoom / level;
      if (zoomAmount === Infinity) zoomAmount = Number.MAX_SAFE_INTEGER / 100;
      point2 = point2 || new Point(width2 / 2 / zoomX + v.x, height2 / 2 / zoomY + v.y);
      const box = new Box(v).transform(new Matrix({
        scale: zoomAmount,
        origin: point2
      }));
      return this.viewbox(box);
    }
  } });
  register(Box, "Box");
  var List = class extends Array {
    constructor(arr = [], ...args) {
      super(arr, ...args);
      if (typeof arr === "number") return this;
      this.length = 0;
      this.push(...arr);
    }
  };
  extend([List], {
    each(fnOrMethodName, ...args) {
      if (typeof fnOrMethodName === "function") return this.map((el2, i, arr) => {
        return fnOrMethodName.call(el2, el2, i, arr);
      });
      else return this.map((el2) => {
        return el2[fnOrMethodName](...args);
      });
    },
    toArray() {
      return Array.prototype.concat.apply([], this);
    }
  });
  var reserved = [
    "toArray",
    "constructor",
    "each"
  ];
  List.extend = function(methods2) {
    methods2 = methods2.reduce((obj, name) => {
      if ((0, import_includes.default)(reserved).call(reserved, name)) return obj;
      if (name[0] === "_") return obj;
      if (name in Array.prototype) obj["$" + name] = Array.prototype[name];
      obj[name] = function(...attrs2) {
        return this.each(name, ...attrs2);
      };
      return obj;
    }, {});
    extend([List], methods2);
  };
  function getReferenceId(value) {
    let referenceValue = (value + "").trim();
    const url = referenceValue.match(/^url\((.*)\)$/i);
    if (url) {
      referenceValue = url[1].trim();
      const quote = referenceValue[0];
      if (quote === '"' || quote === "'") {
        if (referenceValue[referenceValue.length - 1] !== quote) return null;
        referenceValue = referenceValue.slice(1, -1);
      }
    }
    const match = referenceValue.match(reference);
    return match ? match[1].slice(1) : null;
  }
  function findById(rootNode, id) {
    const selector = `#${globals.window.CSS.escape(id)}`;
    if (rootNode.nodeType === 1 && rootNode.matches(selector)) return rootNode;
    return rootNode.querySelector(selector);
  }
  function resolveReference(node, value) {
    const id = getReferenceId(value);
    return id ? findById(node.getRootNode(), id) : null;
  }
  function findReferences(node, attribute, selector = `[${attribute}]`) {
    const id = node.getAttribute("id");
    const rootNode = node.getRootNode();
    if (!id || findById(rootNode, id) !== node) return new List();
    const references = [];
    if (rootNode.nodeType === 1 && rootNode.matches(selector) && getReferenceId(rootNode.getAttribute(attribute)) === id) references.push(adopt(rootNode));
    for (const element of rootNode.querySelectorAll(selector)) if (getReferenceId(element.getAttribute(attribute)) === id) references.push(adopt(element));
    return new List(references);
  }
  function baseFind(query, parent) {
    return new List(map((parent || globals.document).querySelectorAll(query), function(node) {
      return adopt(node);
    }));
  }
  function find(query) {
    return baseFind(query, this.node);
  }
  function findOne(query) {
    return adopt(this.node.querySelector(query));
  }
  var listenerId = 0;
  var eventStore = /* @__PURE__ */ new WeakMap();
  var listenerIds = /* @__PURE__ */ new WeakMap();
  var createEventMap = () => /* @__PURE__ */ Object.create(null);
  function getEvents(instance) {
    const holder = instance.getEventHolder();
    let bag = eventStore.get(holder);
    if (!bag) {
      bag = createEventMap();
      eventStore.set(holder, bag);
    }
    return bag;
  }
  function getEventTarget(instance) {
    return instance.getEventTarget();
  }
  function clearEvents(instance) {
    eventStore.delete(instance.getEventHolder());
  }
  function on(node, events, listener, binding, options) {
    const l = listener.bind(binding || node);
    const listenerOptions = options || false;
    const instance = makeInstance(node);
    const bag = getEvents(instance);
    const n3 = getEventTarget(instance);
    events = Array.isArray(events) ? events : events.split(delimiter);
    let id = listenerIds.get(listener);
    if (!id) {
      id = ++listenerId;
      listenerIds.set(listener, id);
    }
    events.forEach(function(event) {
      const ev = event.split(".")[0];
      const ns = event.split(".")[1] || "*";
      bag[ev] = bag[ev] || createEventMap();
      bag[ev][ns] = bag[ev][ns] || createEventMap();
      bag[ev][ns][id] = bag[ev][ns][id] || [];
      bag[ev][ns][id].push({
        listener: l,
        options: listenerOptions
      });
      n3.addEventListener(ev, l, listenerOptions);
    });
  }
  function off(node, events, listener, options) {
    const instance = makeInstance(node);
    const bag = getEvents(instance);
    const n3 = getEventTarget(instance);
    if (typeof listener === "function") {
      listener = listenerIds.get(listener);
      if (!listener) return;
    }
    events = Array.isArray(events) ? events : (events || "").split(delimiter);
    events.forEach(function(event) {
      const ev = event && event.split(".")[0];
      const ns = event && event.split(".")[1];
      let namespace, l;
      if (listener) {
        if (bag[ev] && bag[ev][ns || "*"]) {
          const listeners = bag[ev][ns || "*"][listener];
          if (!listeners) return;
          listeners.forEach(function(registration) {
            n3.removeEventListener(ev, registration.listener, registration.options ?? options ?? false);
          });
          delete bag[ev][ns || "*"][listener];
        }
      } else if (ev && ns) {
        if (bag[ev] && bag[ev][ns]) {
          for (l in bag[ev][ns]) off(n3, [ev, ns].join("."), l);
          delete bag[ev][ns];
        }
      } else if (ns) {
        for (event in bag) for (namespace in bag[event]) if (ns === namespace) off(n3, [event, ns].join("."));
      } else if (ev) {
        if (bag[ev]) {
          for (namespace in bag[ev]) off(n3, [ev, namespace].join("."));
          delete bag[ev];
        }
      } else {
        for (event in bag) off(n3, event);
        clearEvents(instance);
      }
    });
  }
  function dispatch(node, event, data2, options) {
    const n3 = getEventTarget(node);
    if (event instanceof globals.window.Event) n3.dispatchEvent(event);
    else {
      event = new globals.window.CustomEvent(event, {
        detail: data2,
        cancelable: true,
        ...options
      });
      n3.dispatchEvent(event);
    }
    return event;
  }
  var EventTarget = class extends Base {
    addEventListener() {
    }
    dispatch(event, data2, options) {
      return dispatch(this, event, data2, options);
    }
    dispatchEvent(event) {
      const events = getEvents(this)[event.type];
      if (!events) return true;
      for (const i in events) for (const j in events[i]) events[i][j].forEach(function(registration) {
        registration.listener(event);
      });
      return !event.defaultPrevented;
    }
    fire(event, data2, options) {
      this.dispatch(event, data2, options);
      return this;
    }
    getEventHolder() {
      return this;
    }
    getEventTarget() {
      return this;
    }
    off(event, listener, options) {
      off(this, event, listener, options);
      return this;
    }
    on(event, listener, binding, options) {
      on(this, event, listener, binding, options);
      return this;
    }
    removeEventListener() {
    }
  };
  register(EventTarget, "EventTarget");
  function noop() {
  }
  var timeline = {
    duration: 400,
    ease: ">",
    delay: 0
  };
  var attrs = {
    "fill-opacity": 1,
    "stroke-opacity": 1,
    "stroke-width": 0,
    "stroke-linejoin": "miter",
    "stroke-linecap": "butt",
    fill: "#000000",
    stroke: "#000000",
    opacity: 1,
    x: 0,
    y: 0,
    cx: 0,
    cy: 0,
    width: 0,
    height: 0,
    r: 0,
    rx: 0,
    ry: 0,
    offset: 0,
    "stop-opacity": 1,
    "stop-color": "#000000",
    "text-anchor": "start"
  };
  var SVGArray = class extends Array {
    constructor(...args) {
      super(...args);
      this.init(...args);
    }
    clone() {
      return new this.constructor(this);
    }
    init(arr) {
      if (typeof arr === "number") return this;
      this.length = 0;
      this.push(...this.parse(arr));
      return this;
    }
    parse(array2 = []) {
      if (array2 instanceof Array) return array2;
      return array2.trim().split(delimiter).map(parseFloat);
    }
    toArray() {
      return Array.prototype.concat.apply([], this);
    }
    toSet() {
      return new Set(this);
    }
    toString() {
      return this.join(" ");
    }
    valueOf() {
      const ret = [];
      ret.push(...this);
      return ret;
    }
  };
  var SVGNumber = class SVGNumber2 {
    constructor(...args) {
      this.init(...args);
    }
    convert(unit) {
      return new SVGNumber2(this.value, unit);
    }
    divide(number) {
      number = new SVGNumber2(number);
      return new SVGNumber2(this / number, this.unit || number.unit);
    }
    init(value, unit) {
      unit = Array.isArray(value) ? value[1] : unit;
      value = Array.isArray(value) ? value[0] : value;
      this.value = 0;
      this.unit = unit || "";
      if (typeof value === "number") this.value = isNaN(value) ? 0 : !isFinite(value) ? value < 0 ? -34e37 : 34e37 : value;
      else if (typeof value === "string") {
        unit = value.match(numberAndUnit);
        if (unit) {
          this.value = parseFloat(unit[1]);
          if (unit[5] === "%") this.value /= 100;
          else if (unit[5] === "s") this.value *= 1e3;
          this.unit = unit[5];
        }
      } else if (value instanceof SVGNumber2) {
        this.value = value.valueOf();
        this.unit = value.unit;
      }
      return this;
    }
    minus(number) {
      number = new SVGNumber2(number);
      return new SVGNumber2(this - number, this.unit || number.unit);
    }
    plus(number) {
      number = new SVGNumber2(number);
      return new SVGNumber2(this + number, this.unit || number.unit);
    }
    times(number) {
      number = new SVGNumber2(number);
      return new SVGNumber2(this * number, this.unit || number.unit);
    }
    toArray() {
      return [this.value, this.unit];
    }
    toJSON() {
      return this.toString();
    }
    toString() {
      return (this.unit === "%" ? ~~(this.value * 1e8) / 1e6 : this.unit === "s" ? this.value / 1e3 : this.value) + this.unit;
    }
    valueOf() {
      return this.value;
    }
  };
  var colorAttributes = /* @__PURE__ */ new Set([
    "fill",
    "stroke",
    "color",
    "bgcolor",
    "stop-color",
    "flood-color",
    "lighting-color"
  ]);
  var hooks = [];
  function registerAttrHook(fn) {
    hooks.push(fn);
  }
  function attr(attr2, val, ns) {
    if (attr2 == null) {
      attr2 = {};
      val = this.node.attributes;
      for (const node of val) attr2[node.nodeName] = isNumber.test(node.nodeValue) ? parseFloat(node.nodeValue) : node.nodeValue;
      return attr2;
    } else if (attr2 instanceof Array) return attr2.reduce((last, curr) => {
      last[curr] = this.attr(curr);
      return last;
    }, {});
    else if (typeof attr2 === "object" && attr2.constructor === Object) for (val in attr2) this.attr(val, attr2[val]);
    else if (val === null) this.node.removeAttribute(attr2);
    else if (val == null) {
      val = this.node.getAttribute(attr2);
      return val == null ? attrs[attr2] : isNumber.test(val) ? parseFloat(val) : val;
    } else {
      val = hooks.reduce((_val, hook) => {
        return hook(attr2, _val, this);
      }, val);
      if (typeof val === "number") val = new SVGNumber(val);
      else if (colorAttributes.has(attr2) && Color.isColor(val)) val = new Color(val);
      else if (val.constructor === Array) val = new SVGArray(val);
      if (attr2 === "leading") {
        if (this.leading) this.leading(val);
      } else typeof ns === "string" ? this.node.setAttributeNS(ns, attr2, val.toString()) : this.node.setAttribute(attr2, val.toString());
      if (this.rebuild && (attr2 === "font-size" || attr2 === "x")) this.rebuild();
    }
    return this;
  }
  var Dom = class Dom2 extends EventTarget {
    constructor(node, attrs2) {
      super();
      this.node = node;
      this.type = node.nodeName;
      if (attrs2 && node !== attrs2) this.attr(attrs2);
    }
    add(element, i) {
      element = makeInstance(element);
      if (element.removeNamespace && this.node instanceof globals.window.SVGElement) element.removeNamespace();
      if (i == null) this.node.appendChild(element.node);
      else if (element.node !== this.node.childNodes[i]) this.node.insertBefore(element.node, this.node.childNodes[i]);
      return this;
    }
    addTo(parent, i) {
      return makeInstance(parent).put(this, i);
    }
    children() {
      return new List(map(this.node.children, function(node) {
        return adopt(node);
      }));
    }
    clear() {
      while (this.node.hasChildNodes()) this.node.removeChild(this.node.lastChild);
      return this;
    }
    clone(deep = true, assignNewIds = true) {
      this.writeDataToDom();
      let nodeClone = this.node.cloneNode(deep);
      if (assignNewIds) nodeClone = assignNewId(nodeClone);
      return new this.constructor(nodeClone);
    }
    each(block, deep) {
      const children = this.children();
      let i, il;
      for (i = 0, il = children.length; i < il; i++) {
        block.apply(children[i], [i, children]);
        if (deep) children[i].each(block, deep);
      }
      return this;
    }
    element(nodeName, attrs2) {
      return this.put(new Dom2(create(nodeName), attrs2));
    }
    first() {
      return adopt(this.node.firstChild);
    }
    get(i) {
      return adopt(this.node.childNodes[i]);
    }
    getEventHolder() {
      return this.node;
    }
    getEventTarget() {
      return this.node;
    }
    has(element) {
      return this.index(element) >= 0;
    }
    html(htmlOrFn, outerHTML) {
      return this.xml(htmlOrFn, outerHTML, html);
    }
    id(id) {
      if (typeof id === "undefined" && !this.node.id) this.node.id = eid(this.type);
      return this.attr("id", id);
    }
    index(element) {
      return [].slice.call(this.node.childNodes).indexOf(element.node);
    }
    last() {
      return adopt(this.node.lastChild);
    }
    matches(selector) {
      const el2 = this.node;
      const matcher = el2.matches || el2.matchesSelector || el2.msMatchesSelector || el2.mozMatchesSelector || el2.webkitMatchesSelector || el2.oMatchesSelector || null;
      return matcher && matcher.call(el2, selector);
    }
    parent(type) {
      let parent = this;
      if (!parent.node.parentNode) return null;
      parent = adopt(parent.node.parentNode);
      if (!type) return parent;
      do
        if (typeof type === "string" ? parent.matches(type) : parent instanceof type) return parent;
      while (parent = adopt(parent.node.parentNode));
      return parent;
    }
    put(element, i) {
      element = makeInstance(element);
      this.add(element, i);
      return element;
    }
    putIn(parent, i) {
      return makeInstance(parent).add(this, i);
    }
    remove() {
      if (this.parent()) this.parent().removeElement(this);
      return this;
    }
    removeElement(element) {
      this.node.removeChild(element.node);
      return this;
    }
    replace(element) {
      element = makeInstance(element);
      if (this.node.parentNode) this.node.parentNode.replaceChild(element.node, this.node);
      return element;
    }
    round(precision = 2, map2 = null) {
      const factor = 10 ** precision;
      const attrs2 = this.attr(map2);
      for (const i in attrs2) if (typeof attrs2[i] === "number") attrs2[i] = Math.round(attrs2[i] * factor) / factor;
      this.attr(attrs2);
      return this;
    }
    svg(svgOrFn, outerSVG) {
      return this.xml(svgOrFn, outerSVG, svg);
    }
    toString() {
      return this.id();
    }
    words(text) {
      this.node.textContent = text;
      return this;
    }
    wrap(node) {
      const parent = this.parent();
      if (!parent) return this.addTo(node);
      const position2 = parent.index(this);
      return parent.put(node, position2).put(this);
    }
    writeDataToDom() {
      this.each(function() {
        this.writeDataToDom();
      });
      return this;
    }
    xml(xmlOrFn, outerXML, ns) {
      if (typeof xmlOrFn === "boolean") {
        ns = outerXML;
        outerXML = xmlOrFn;
        xmlOrFn = null;
      }
      if (xmlOrFn == null || typeof xmlOrFn === "function") {
        outerXML = outerXML == null ? true : outerXML;
        this.writeDataToDom();
        let current = this;
        if (xmlOrFn != null) {
          current = adopt(current.node.cloneNode(true));
          if (outerXML) {
            const result = xmlOrFn(current);
            current = result || current;
            if (result === false) return "";
          }
          current.each(function() {
            const result = xmlOrFn(this);
            const _this = result || this;
            if (result === false) this.remove();
            else if (result && this !== _this) this.replace(_this);
          }, true);
        }
        return outerXML ? current.node.outerHTML : current.node.innerHTML;
      }
      outerXML = outerXML == null ? false : outerXML;
      const well = create("wrapper", ns);
      const fragment = globals.document.createDocumentFragment();
      well.innerHTML = xmlOrFn;
      for (let len = well.children.length; len--; ) fragment.appendChild(well.firstElementChild);
      const parent = this.parent();
      return outerXML ? this.replace(fragment) && parent : this.add(fragment);
    }
  };
  extend(Dom, {
    attr,
    find,
    findOne
  });
  register(Dom, "Dom");
  var Element = class extends Dom {
    constructor(node, attrs2) {
      super(node, attrs2);
      this.dom = {};
      this.node.instance = this;
      if (node.hasAttribute("data-svgjs") || node.hasAttribute("svgjs:data")) this.setData(JSON.parse(node.getAttribute("data-svgjs")) ?? JSON.parse(node.getAttribute("svgjs:data")) ?? {});
    }
    center(x2, y2) {
      return this.cx(x2).cy(y2);
    }
    cx(x2) {
      return x2 == null ? this.x() + this.width() / 2 : this.x(x2 - this.width() / 2);
    }
    cy(y2) {
      return y2 == null ? this.y() + this.height() / 2 : this.y(y2 - this.height() / 2);
    }
    defs() {
      const root2 = this.root();
      return root2 && root2.defs();
    }
    dmove(x2, y2) {
      return this.dx(x2).dy(y2);
    }
    dx(x2 = 0) {
      return this.x(new SVGNumber(x2).plus(this.x()));
    }
    dy(y2 = 0) {
      return this.y(new SVGNumber(y2).plus(this.y()));
    }
    getEventHolder() {
      return this;
    }
    height(height2) {
      return this.attr("height", height2);
    }
    move(x2, y2) {
      return this.x(x2).y(y2);
    }
    parents(until = this.root()) {
      const isSelector = typeof until === "string";
      const root2 = this.root();
      const rootNode = root2 && root2.node;
      if (!isSelector) until = until && makeInstance(until).node;
      const parents = new List();
      let parent = this;
      while ((parent = parent.parent()) && parent.node !== globals.document && parent.node.nodeName !== "#document-fragment") {
        parents.push(parent);
        if (!isSelector && parent.node === until) break;
        if (isSelector && parent.matches(until)) break;
        if (rootNode && parent.node === rootNode) return null;
      }
      return parents;
    }
    reference(attr2) {
      attr2 = this.attr(attr2);
      if (!attr2) return null;
      const target = resolveReference(this.node, attr2);
      return target ? makeInstance(target) : null;
    }
    root() {
      const p = this.parent(getClass(root));
      return p && p.root();
    }
    setData(o) {
      this.dom = o;
      return this;
    }
    size(width2, height2) {
      const p = proportionalSize(this, width2, height2);
      return this.width(new SVGNumber(p.width)).height(new SVGNumber(p.height));
    }
    width(width2) {
      return this.attr("width", width2);
    }
    writeDataToDom(defaults) {
      writeDataToDom(this, this.dom, defaults);
      return super.writeDataToDom();
    }
    x(x2) {
      return this.attr("x", x2);
    }
    y(y2) {
      return this.attr("y", y2);
    }
  };
  extend(Element, {
    bbox,
    rbox,
    inside,
    point,
    ctm,
    screenCTM
  });
  register(Element, "Element");
  var sugar = {
    stroke: [
      "color",
      "width",
      "opacity",
      "linecap",
      "linejoin",
      "miterlimit",
      "dasharray",
      "dashoffset"
    ],
    fill: [
      "color",
      "opacity",
      "rule"
    ],
    prefix: function(t, a) {
      return a === "color" ? t : t + "-" + a;
    }
  };
  ["fill", "stroke"].forEach(function(m) {
    const extension = {};
    let i;
    extension[m] = function(o) {
      if (typeof o === "undefined") return this.attr(m);
      if (typeof o === "string" || o instanceof Color || Color.isRgb(o) || o instanceof Element) this.attr(m, o);
      else for (i = sugar[m].length - 1; i >= 0; i--) if (o[sugar[m][i]] != null) this.attr(sugar.prefix(m, sugar[m][i]), o[sugar[m][i]]);
      return this;
    };
    registerMethods(["Element", "Runner"], extension);
  });
  registerMethods(["Element", "Runner"], {
    matrix: function(mat, b, c, d, e, f) {
      if (mat == null) return new Matrix(this);
      return this.attr("transform", new Matrix(mat, b, c, d, e, f));
    },
    rotate: function(angle, cx2, cy2) {
      return this.transform({
        rotate: angle,
        ox: cx2,
        oy: cy2
      }, true);
    },
    skew: function(x2, y2, cx2, cy2) {
      return arguments.length === 1 || arguments.length === 3 ? this.transform({
        skew: x2,
        ox: y2,
        oy: cx2
      }, true) : this.transform({
        skew: [x2, y2],
        ox: cx2,
        oy: cy2
      }, true);
    },
    shear: function(lam, cx2, cy2) {
      return this.transform({
        shear: lam,
        ox: cx2,
        oy: cy2
      }, true);
    },
    scale: function(x2, y2, cx2, cy2) {
      return arguments.length === 1 || arguments.length === 3 ? this.transform({
        scale: x2,
        ox: y2,
        oy: cx2
      }, true) : this.transform({
        scale: [x2, y2],
        ox: cx2,
        oy: cy2
      }, true);
    },
    translate: function(x2, y2) {
      return this.transform({ translate: [x2, y2] }, true);
    },
    relative: function(x2, y2) {
      return this.transform({ relative: [x2, y2] }, true);
    },
    flip: function(direction = "both", origin = "center") {
      if ("xybothtrue".indexOf(direction) === -1) {
        origin = direction;
        direction = "both";
      }
      return this.transform({
        flip: direction,
        origin
      }, true);
    },
    opacity: function(value) {
      return this.attr("opacity", value);
    }
  });
  registerMethods("radius", { radius: function(x2, y2 = x2) {
    return (this._element || this).type === "radialGradient" ? this.attr("r", new SVGNumber(x2)) : this.rx(x2).ry(y2);
  } });
  registerMethods("Path", {
    length: function() {
      return this.node.getTotalLength();
    },
    pointAt: function(length2) {
      return new Point(this.node.getPointAtLength(length2));
    }
  });
  registerMethods(["Element", "Runner"], { font: function(a, v) {
    if (typeof a === "object") {
      for (v in a) this.font(v, a[v]);
      return this;
    }
    return a === "leading" ? this.leading(v) : a === "anchor" ? this.attr("text-anchor", v) : a === "size" || a === "family" || a === "weight" || a === "stretch" || a === "variant" || a === "style" ? this.attr("font-" + a, v) : this.attr(a, v);
  } });
  registerMethods("Element", [
    "click",
    "dblclick",
    "mousedown",
    "mouseup",
    "mouseover",
    "mouseout",
    "mousemove",
    "mouseenter",
    "mouseleave",
    "touchstart",
    "touchmove",
    "touchleave",
    "touchend",
    "touchcancel",
    "contextmenu",
    "wheel",
    "pointerdown",
    "pointermove",
    "pointerup",
    "pointerleave",
    "pointercancel"
  ].reduce(function(last, event) {
    const fn = function(f) {
      if (f === null) this.off(event);
      else this.on(event, f);
      return this;
    };
    last[event] = fn;
    return last;
  }, {}));
  function untransform() {
    return this.attr("transform", null);
  }
  function matrixify() {
    return (this.attr("transform") || "").split(transforms).slice(0, -1).map(function(str) {
      const kv = str.trim().split("(");
      return [kv[0].trim(), kv[1].split(delimiter).map(function(str2) {
        return parseFloat(str2);
      })];
    }).reverse().reduce(function(matrix, transform2) {
      if (transform2[0] === "matrix") return matrix.lmultiply(Matrix.fromArray(transform2[1]));
      return matrix[transform2[0]].apply(matrix, transform2[1]);
    }, new Matrix());
  }
  function toParent(parent, i) {
    if (this === parent) return this;
    if (isDescriptive(this.node)) return this.addTo(parent, i);
    const ctm2 = this.screenCTM();
    const pCtm = parent.screenCTM().inverse();
    this.addTo(parent, i).untransform().transform(pCtm.multiply(ctm2));
    return this;
  }
  function toRoot(i) {
    return this.toParent(this.root(), i);
  }
  function transform(o, relative) {
    if (o == null || typeof o === "string") {
      const decomposed = new Matrix(this).decompose();
      return o == null ? decomposed : decomposed[o];
    }
    if (!Matrix.isMatrixLike(o)) o = {
      ...o,
      origin: getOrigin(o, this)
    };
    const result = new Matrix(relative === true ? this : relative || false).transform(o);
    return this.attr("transform", result);
  }
  registerMethods("Element", {
    untransform,
    matrixify,
    toParent,
    toRoot,
    transform
  });
  var Container = class Container2 extends Element {
    flatten() {
      this.each(function() {
        if (this instanceof Container2) return this.flatten().ungroup();
      });
      return this;
    }
    ungroup(parent = this.parent(), index = parent.index(this)) {
      index = index === -1 ? parent.children().length : index;
      this.each(function(i, children) {
        return children[children.length - i - 1].toParent(parent, index);
      });
      return this.remove();
    }
  };
  register(Container, "Container");
  var Defs = class extends Container {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("defs", node), attrs2);
    }
    flatten() {
      return this;
    }
    ungroup() {
      return this;
    }
  };
  register(Defs, "Defs");
  var Shape = class extends Element {
  };
  register(Shape, "Shape");
  var circled_exports = /* @__PURE__ */ __exportAll({
    cx: () => cx$1,
    cy: () => cy$1,
    height: () => height$2,
    rx: () => rx,
    ry: () => ry,
    width: () => width$2,
    x: () => x$3,
    y: () => y$3
  });
  function rx(rx2) {
    return this.attr("rx", rx2);
  }
  function ry(ry2) {
    return this.attr("ry", ry2);
  }
  function x$3(x2) {
    return x2 == null ? this.cx() - this.rx() : this.cx(x2 + this.rx());
  }
  function y$3(y2) {
    return y2 == null ? this.cy() - this.ry() : this.cy(y2 + this.ry());
  }
  function cx$1(x2) {
    return this.attr("cx", x2);
  }
  function cy$1(y2) {
    return this.attr("cy", y2);
  }
  function width$2(width2) {
    return width2 == null ? this.rx() * 2 : this.rx(new SVGNumber(width2).divide(2));
  }
  function height$2(height2) {
    return height2 == null ? this.ry() * 2 : this.ry(new SVGNumber(height2).divide(2));
  }
  var Ellipse = class extends Shape {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("ellipse", node), attrs2);
    }
    size(width2, height2) {
      const p = proportionalSize(this, width2, height2);
      return this.rx(new SVGNumber(p.width).divide(2)).ry(new SVGNumber(p.height).divide(2));
    }
  };
  extend(Ellipse, circled_exports);
  registerMethods("Container", { ellipse: wrapWithAttrCheck(function(width2 = 0, height2 = width2) {
    return this.put(new Ellipse()).size(width2, height2).move(0, 0);
  }) });
  register(Ellipse, "Ellipse");
  var Fragment = class extends Dom {
    constructor(node = globals.document.createDocumentFragment()) {
      super(node);
    }
    xml(xmlOrFn, outerXML, ns) {
      if (typeof xmlOrFn === "boolean") {
        ns = outerXML;
        outerXML = xmlOrFn;
        xmlOrFn = null;
      }
      if (xmlOrFn == null || typeof xmlOrFn === "function") {
        const wrapper = new Dom(create("wrapper", ns));
        wrapper.add(this.node.cloneNode(true));
        return wrapper.xml(false, ns);
      }
      return super.xml(xmlOrFn, false, ns);
    }
  };
  register(Fragment, "Fragment");
  var gradiented_exports = /* @__PURE__ */ __exportAll({
    from: () => from,
    to: () => to
  });
  function from(x2, y2) {
    return (this._element || this).type === "radialGradient" ? this.attr({
      fx: new SVGNumber(x2),
      fy: new SVGNumber(y2)
    }) : this.attr({
      x1: new SVGNumber(x2),
      y1: new SVGNumber(y2)
    });
  }
  function to(x2, y2) {
    return (this._element || this).type === "radialGradient" ? this.attr({
      cx: new SVGNumber(x2),
      cy: new SVGNumber(y2)
    }) : this.attr({
      x2: new SVGNumber(x2),
      y2: new SVGNumber(y2)
    });
  }
  var Gradient = class extends Container {
    constructor(type, attrs2) {
      super(nodeOrNew(type + "Gradient", typeof type === "string" ? null : type), attrs2);
    }
    attr(a, b, c) {
      if (a === "transform") a = "gradientTransform";
      return super.attr(a, b, c);
    }
    bbox() {
      return new Box();
    }
    targets() {
      return findReferences(this.node, "fill");
    }
    toString() {
      return this.url();
    }
    update(block) {
      this.clear();
      if (typeof block === "function") block.call(this, this);
      return this;
    }
    url() {
      return "url(#" + this.id() + ")";
    }
  };
  extend(Gradient, gradiented_exports);
  registerMethods({
    Container: { gradient(...args) {
      return this.defs().gradient(...args);
    } },
    Defs: { gradient: wrapWithAttrCheck(function(type, block) {
      return this.put(new Gradient(type)).update(block);
    }) }
  });
  register(Gradient, "Gradient");
  var Pattern = class extends Container {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("pattern", node), attrs2);
    }
    attr(a, b, c) {
      if (a === "transform") a = "patternTransform";
      return super.attr(a, b, c);
    }
    bbox() {
      return new Box();
    }
    targets() {
      return findReferences(this.node, "fill");
    }
    toString() {
      return this.url();
    }
    update(block) {
      this.clear();
      if (typeof block === "function") block.call(this, this);
      return this;
    }
    url() {
      return "url(#" + this.id() + ")";
    }
  };
  registerMethods({
    Container: { pattern(...args) {
      return this.defs().pattern(...args);
    } },
    Defs: { pattern: wrapWithAttrCheck(function(width2, height2, block) {
      return this.put(new Pattern()).update(block).attr({
        x: 0,
        y: 0,
        width: width2,
        height: height2,
        patternUnits: "userSpaceOnUse"
      });
    }) }
  });
  register(Pattern, "Pattern");
  var Image = class extends Shape {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("image", node), attrs2);
    }
    load(url, callback) {
      if (!url) return this;
      const img = new globals.window.Image();
      on(img, "load", function(e) {
        const p = this.parent(Pattern);
        if (this.width() === 0 && this.height() === 0) this.size(img.width, img.height);
        if (p instanceof Pattern) {
          if (p.width() === 0 && p.height() === 0) p.size(this.width(), this.height());
        }
        if (typeof callback === "function") callback.call(this, e);
      }, this);
      on(img, "load error", function() {
        off(img);
      });
      return this.attr("href", img.src = url, xlink);
    }
  };
  registerAttrHook(function(attr2, val, _this) {
    if (attr2 === "fill" || attr2 === "stroke") {
      if (isImage.test(val)) val = _this.root().defs().image(val);
    }
    if (val instanceof Image) val = _this.root().defs().pattern(0, 0, (pattern) => {
      pattern.add(val);
    });
    return val;
  });
  registerMethods({ Container: { image: wrapWithAttrCheck(function(source, callback) {
    return this.put(new Image()).size(0, 0).load(source, callback);
  }) } });
  register(Image, "Image");
  var PointArray = class extends SVGArray {
    bbox() {
      let maxX = -Infinity;
      let maxY = -Infinity;
      let minX = Infinity;
      let minY = Infinity;
      this.forEach(function(el2) {
        maxX = Math.max(el2[0], maxX);
        maxY = Math.max(el2[1], maxY);
        minX = Math.min(el2[0], minX);
        minY = Math.min(el2[1], minY);
      });
      return new Box(minX, minY, maxX - minX, maxY - minY);
    }
    move(x2, y2) {
      const box = this.bbox();
      x2 -= box.x;
      y2 -= box.y;
      if (!isNaN(x2) && !isNaN(y2)) for (let i = this.length - 1; i >= 0; i--) this[i] = [this[i][0] + x2, this[i][1] + y2];
      return this;
    }
    parse(array2 = [0, 0]) {
      const points = [];
      if (array2 instanceof Array) array2 = Array.prototype.concat.apply([], array2);
      else array2 = array2.trim().split(delimiter).map(parseFloat);
      if (array2.length % 2 !== 0) array2.pop();
      for (let i = 0, len = array2.length; i < len; i = i + 2) points.push([array2[i], array2[i + 1]]);
      return points;
    }
    size(width2, height2) {
      let i;
      const box = this.bbox();
      for (i = this.length - 1; i >= 0; i--) {
        if (box.width) this[i][0] = (this[i][0] - box.x) * width2 / box.width + box.x;
        if (box.height) this[i][1] = (this[i][1] - box.y) * height2 / box.height + box.y;
      }
      return this;
    }
    toLine() {
      return {
        x1: this[0][0],
        y1: this[0][1],
        x2: this[1][0],
        y2: this[1][1]
      };
    }
    toString() {
      const array2 = [];
      for (let i = 0, il = this.length; i < il; i++) array2.push(this[i].join(","));
      return array2.join(" ");
    }
    transform(m) {
      return this.clone().transformO(m);
    }
    transformO(m) {
      if (!Matrix.isMatrixLike(m)) m = new Matrix(m);
      for (let i = this.length; i--; ) {
        const [x2, y2] = this[i];
        this[i][0] = m.a * x2 + m.c * y2 + m.e;
        this[i][1] = m.b * x2 + m.d * y2 + m.f;
      }
      return this;
    }
  };
  var pointed_exports = /* @__PURE__ */ __exportAll({
    MorphArray: () => MorphArray,
    height: () => height$1,
    width: () => width$1,
    x: () => x$2,
    y: () => y$2
  });
  var MorphArray = PointArray;
  function x$2(x2) {
    return x2 == null ? this.bbox().x : this.move(x2, this.bbox().y);
  }
  function y$2(y2) {
    return y2 == null ? this.bbox().y : this.move(this.bbox().x, y2);
  }
  function width$1(width2) {
    const b = this.bbox();
    return width2 == null ? b.width : this.size(width2, b.height);
  }
  function height$1(height2) {
    const b = this.bbox();
    return height2 == null ? b.height : this.size(b.width, height2);
  }
  var Line = class extends Shape {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("line", node), attrs2);
    }
    array() {
      return new PointArray([[this.attr("x1"), this.attr("y1")], [this.attr("x2"), this.attr("y2")]]);
    }
    move(x2, y2) {
      return this.attr(this.array().move(x2, y2).toLine());
    }
    plot(x1, y1, x2, y2) {
      if (x1 == null) return this.array();
      else if (typeof y1 !== "undefined") x1 = {
        x1,
        y1,
        x2,
        y2
      };
      else x1 = new PointArray(x1).toLine();
      return this.attr(x1);
    }
    size(width2, height2) {
      const p = proportionalSize(this, width2, height2);
      return this.attr(this.array().size(p.width, p.height).toLine());
    }
  };
  extend(Line, pointed_exports);
  registerMethods({ Container: { line: wrapWithAttrCheck(function(...args) {
    return Line.prototype.plot.apply(this.put(new Line()), args[0] != null ? args : [
      0,
      0,
      0,
      0
    ]);
  }) } });
  register(Line, "Line");
  var Marker = class extends Container {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("marker", node), attrs2);
    }
    height(height2) {
      return this.attr("markerHeight", height2);
    }
    orient(orient) {
      return this.attr("orient", orient);
    }
    ref(x2, y2) {
      return this.attr("refX", x2).attr("refY", y2);
    }
    toString() {
      return "url(#" + this.id() + ")";
    }
    update(block) {
      this.clear();
      if (typeof block === "function") block.call(this, this);
      return this;
    }
    width(width2) {
      return this.attr("markerWidth", width2);
    }
  };
  registerMethods({
    Container: { marker(...args) {
      return this.defs().marker(...args);
    } },
    Defs: { marker: wrapWithAttrCheck(function(width2, height2, block) {
      return this.put(new Marker()).size(width2, height2).ref(width2 / 2, height2 / 2).viewbox(0, 0, width2, height2).attr("orient", "auto").update(block);
    }) },
    marker: { marker(marker, width2, height2, block) {
      let attr2 = ["marker"];
      if (marker !== "all") attr2.push(marker);
      attr2 = attr2.join("-");
      marker = arguments[1] instanceof Marker ? arguments[1] : this.defs().marker(width2, height2, block);
      return this.attr(attr2, marker);
    } }
  });
  register(Marker, "Marker");
  function makeSetterGetter(k, f) {
    return function(v) {
      if (v == null) return this[k];
      this[k] = v;
      if (f) f.call(this);
      return this;
    };
  }
  var easing = {
    "-": function(pos) {
      return pos;
    },
    "<>": function(pos) {
      return -Math.cos(pos * Math.PI) / 2 + 0.5;
    },
    ">": function(pos) {
      return Math.sin(pos * Math.PI / 2);
    },
    "<": function(pos) {
      return -Math.cos(pos * Math.PI / 2) + 1;
    },
    bezier: function(x1, y1, x2, y2) {
      return function(t) {
        if (t < 0) if (x1 > 0) return y1 / x1 * t;
        else if (x2 > 0) return y2 / x2 * t;
        else return 0;
        else if (t > 1) if (x2 < 1) return (1 - y2) / (1 - x2) * t + (y2 - x2) / (1 - x2);
        else if (x1 < 1) return (1 - y1) / (1 - x1) * t + (y1 - x1) / (1 - x1);
        else return 1;
        else return 3 * t * (1 - t) ** 2 * y1 + 3 * t ** 2 * (1 - t) * y2 + t ** 3;
      };
    },
    steps: function(steps, stepPosition = "end") {
      stepPosition = stepPosition.split("-").reverse()[0];
      let jumps = steps;
      if (stepPosition === "none") --jumps;
      else if (stepPosition === "both") ++jumps;
      return (t, beforeFlag = false) => {
        let step = Math.floor(t * steps);
        const jumping = t * step % 1 === 0;
        if (stepPosition === "start" || stepPosition === "both") ++step;
        if (beforeFlag && jumping) --step;
        if (t >= 0 && step < 0) step = 0;
        if (t <= 1 && step > jumps) step = jumps;
        return step / jumps;
      };
    }
  };
  var Stepper = class {
    done() {
      return false;
    }
  };
  var Ease = class extends Stepper {
    constructor(fn = timeline.ease) {
      super();
      this.ease = easing[fn] || fn;
    }
    step(from2, to2, pos) {
      if (typeof from2 !== "number") return pos < 1 ? from2 : to2;
      return from2 + (to2 - from2) * this.ease(pos);
    }
  };
  var Controller = class extends Stepper {
    constructor(fn) {
      super();
      this.stepper = fn;
    }
    done(c) {
      return c.done;
    }
    step(current, target, dt, c) {
      return this.stepper(current, target, dt, c);
    }
  };
  function recalculate() {
    const duration = (this._duration || 500) / 1e3;
    const overshoot = this._overshoot || 0;
    const eps = 1e-10;
    const pi = Math.PI;
    const os = Math.log(overshoot / 100 + eps);
    const zeta = -os / Math.sqrt(pi * pi + os * os);
    const wn = 3.9 / (zeta * duration);
    this.d = 2 * zeta * wn;
    this.k = wn * wn;
  }
  var Spring = class extends Controller {
    constructor(duration = 500, overshoot = 0) {
      super();
      this.duration(duration).overshoot(overshoot);
    }
    step(current, target, dt, c) {
      if (typeof current === "string") return current;
      c.done = dt === Infinity;
      if (dt === Infinity) return target;
      if (dt === 0) return current;
      if (dt > 100) dt = 16;
      dt /= 1e3;
      const velocity = c.velocity || 0;
      const acceleration = -this.d * velocity - this.k * (current - target);
      const newPosition = current + velocity * dt + acceleration * dt * dt / 2;
      c.velocity = velocity + acceleration * dt;
      c.done = Math.abs(target - newPosition) + Math.abs(velocity) < 2e-3;
      return c.done ? target : newPosition;
    }
  };
  extend(Spring, {
    duration: makeSetterGetter("_duration", recalculate),
    overshoot: makeSetterGetter("_overshoot", recalculate)
  });
  var PID = class extends Controller {
    constructor(p = 0.1, i = 0.01, d = 0, windup = 1e3) {
      super();
      this.p(p).i(i).d(d).windup(windup);
    }
    step(current, target, dt, c) {
      if (typeof current === "string") return current;
      c.done = dt === Infinity;
      if (dt === Infinity) return target;
      if (dt === 0) return current;
      const p = target - current;
      let i = (c.integral || 0) + p * dt;
      const d = (p - (c.error || 0)) / dt;
      const windup = this._windup;
      if (windup !== false) i = Math.max(-windup, Math.min(i, windup));
      c.error = p;
      c.integral = i;
      c.done = Math.abs(p) < 1e-3;
      return c.done ? target : current + (this.P * p + this.I * i + this.D * d);
    }
  };
  extend(PID, {
    windup: makeSetterGetter("_windup"),
    p: makeSetterGetter("P"),
    i: makeSetterGetter("I"),
    d: makeSetterGetter("D")
  });
  var segmentParameters = {
    M: 2,
    L: 2,
    H: 1,
    V: 1,
    C: 6,
    S: 4,
    Q: 4,
    T: 2,
    A: 7,
    Z: 0
  };
  var pathHandlers = {
    M: function(c, p, p0) {
      p.x = p0.x = c[0];
      p.y = p0.y = c[1];
      return [
        "M",
        p.x,
        p.y
      ];
    },
    L: function(c, p) {
      p.x = c[0];
      p.y = c[1];
      return [
        "L",
        c[0],
        c[1]
      ];
    },
    H: function(c, p) {
      p.x = c[0];
      return ["H", c[0]];
    },
    V: function(c, p) {
      p.y = c[0];
      return ["V", c[0]];
    },
    C: function(c, p) {
      p.x = c[4];
      p.y = c[5];
      return [
        "C",
        c[0],
        c[1],
        c[2],
        c[3],
        c[4],
        c[5]
      ];
    },
    S: function(c, p) {
      p.x = c[2];
      p.y = c[3];
      return [
        "S",
        c[0],
        c[1],
        c[2],
        c[3]
      ];
    },
    Q: function(c, p) {
      p.x = c[2];
      p.y = c[3];
      return [
        "Q",
        c[0],
        c[1],
        c[2],
        c[3]
      ];
    },
    T: function(c, p) {
      p.x = c[0];
      p.y = c[1];
      return [
        "T",
        c[0],
        c[1]
      ];
    },
    Z: function(c, p, p0) {
      p.x = p0.x;
      p.y = p0.y;
      return ["Z"];
    },
    A: function(c, p) {
      p.x = c[5];
      p.y = c[6];
      return [
        "A",
        c[0],
        c[1],
        c[2],
        c[3],
        c[4],
        c[5],
        c[6]
      ];
    }
  };
  var mlhvqtcsaz = "mlhvqtcsaz".split("");
  for (let i = 0, il = mlhvqtcsaz.length; i < il; ++i) pathHandlers[mlhvqtcsaz[i]] = /* @__PURE__ */ (function(i2) {
    return function(c, p, p0) {
      if (i2 === "H") c[0] = c[0] + p.x;
      else if (i2 === "V") c[0] = c[0] + p.y;
      else if (i2 === "A") {
        c[5] = c[5] + p.x;
        c[6] = c[6] + p.y;
      } else for (let j = 0, jl = c.length; j < jl; ++j) c[j] = c[j] + (j % 2 ? p.y : p.x);
      return pathHandlers[i2](c, p, p0);
    };
  })(mlhvqtcsaz[i].toUpperCase());
  function makeAbsolut(parser2) {
    return pathHandlers[parser2.segment[0]](parser2.segment.slice(1), parser2.p, parser2.p0);
  }
  function segmentComplete(parser2) {
    return parser2.segment.length && parser2.segment.length - 1 === segmentParameters[parser2.segment[0].toUpperCase()];
  }
  function startNewSegment(parser2, token) {
    parser2.inNumber && finalizeNumber(parser2, false);
    const pathLetter = isPathLetter.test(token);
    if (pathLetter) parser2.segment = [token];
    else {
      const lastCommand = parser2.lastCommand;
      const small = lastCommand.toLowerCase();
      parser2.segment = [small === "m" ? lastCommand === small ? "l" : "L" : lastCommand];
    }
    parser2.inSegment = true;
    parser2.lastCommand = parser2.segment[0];
    return pathLetter;
  }
  function finalizeNumber(parser2, inNumber) {
    if (!parser2.inNumber) throw new Error("Parser Error");
    parser2.number && parser2.segment.push(parseFloat(parser2.number));
    parser2.inNumber = inNumber;
    parser2.number = "";
    parser2.pointSeen = false;
    parser2.hasExponent = false;
    if (segmentComplete(parser2)) finalizeSegment(parser2);
  }
  function finalizeSegment(parser2) {
    parser2.inSegment = false;
    if (parser2.absolute) parser2.segment = makeAbsolut(parser2);
    parser2.segments.push(parser2.segment);
  }
  function isArcFlag(parser2) {
    if (!parser2.segment.length) return false;
    const isArc = parser2.segment[0].toUpperCase() === "A";
    const length2 = parser2.segment.length;
    return isArc && (length2 === 4 || length2 === 5);
  }
  function isExponential(parser2) {
    return parser2.lastToken.toUpperCase() === "E";
  }
  var pathDelimiters = /* @__PURE__ */ new Set([
    " ",
    ",",
    "	",
    "\n",
    "\r",
    "\f"
  ]);
  function pathParser(d, toAbsolute = true) {
    let index = 0;
    let token = "";
    const parser2 = {
      segment: [],
      inNumber: false,
      number: "",
      lastToken: "",
      inSegment: false,
      segments: [],
      pointSeen: false,
      hasExponent: false,
      absolute: toAbsolute,
      p0: new Point(),
      p: new Point()
    };
    while (parser2.lastToken = token, token = d.charAt(index++)) {
      if (!parser2.inSegment) {
        if (startNewSegment(parser2, token)) continue;
      }
      if (token === ".") {
        if (parser2.pointSeen || parser2.hasExponent) {
          finalizeNumber(parser2, false);
          --index;
          continue;
        }
        parser2.inNumber = true;
        parser2.pointSeen = true;
        parser2.number += token;
        continue;
      }
      if (!isNaN(parseInt(token))) {
        if (parser2.number === "0" || isArcFlag(parser2)) {
          parser2.inNumber = true;
          parser2.number = token;
          finalizeNumber(parser2, true);
          continue;
        }
        parser2.inNumber = true;
        parser2.number += token;
        continue;
      }
      if (pathDelimiters.has(token)) {
        if (parser2.inNumber) finalizeNumber(parser2, false);
        continue;
      }
      if (token === "-" || token === "+") {
        if (parser2.inNumber && !isExponential(parser2)) {
          finalizeNumber(parser2, false);
          --index;
          continue;
        }
        parser2.number += token;
        parser2.inNumber = true;
        continue;
      }
      if (token.toUpperCase() === "E") {
        parser2.number += token;
        parser2.hasExponent = true;
        continue;
      }
      if (isPathLetter.test(token)) {
        if (parser2.inNumber) finalizeNumber(parser2, false);
        else if (!segmentComplete(parser2)) throw new Error("parser Error");
        else finalizeSegment(parser2);
        --index;
      }
    }
    if (parser2.inNumber) finalizeNumber(parser2, false);
    if (parser2.inSegment && segmentComplete(parser2)) finalizeSegment(parser2);
    return parser2.segments;
  }
  function arrayToString(a) {
    let s = "";
    for (let i = 0, il = a.length; i < il; i++) {
      s += a[i][0];
      if (a[i][1] != null) {
        s += a[i][1];
        if (a[i][2] != null) {
          s += " ";
          s += a[i][2];
          if (a[i][3] != null) {
            s += " ";
            s += a[i][3];
            s += " ";
            s += a[i][4];
            if (a[i][5] != null) {
              s += " ";
              s += a[i][5];
              s += " ";
              s += a[i][6];
              if (a[i][7] != null) {
                s += " ";
                s += a[i][7];
              }
            }
          }
        }
      }
    }
    return s + " ";
  }
  var PathArray = class extends SVGArray {
    bbox() {
      parser().path.setAttribute("d", this.toString());
      return new Box(parser.nodes.path.getBBox());
    }
    move(x2, y2) {
      const box = this.bbox();
      x2 -= box.x;
      y2 -= box.y;
      if (!isNaN(x2) && !isNaN(y2)) for (let l, i = this.length - 1; i >= 0; i--) {
        l = this[i][0];
        if (l === "M" || l === "L" || l === "T") {
          this[i][1] += x2;
          this[i][2] += y2;
        } else if (l === "H") this[i][1] += x2;
        else if (l === "V") this[i][1] += y2;
        else if (l === "C" || l === "S" || l === "Q") {
          this[i][1] += x2;
          this[i][2] += y2;
          this[i][3] += x2;
          this[i][4] += y2;
          if (l === "C") {
            this[i][5] += x2;
            this[i][6] += y2;
          }
        } else if (l === "A") {
          this[i][6] += x2;
          this[i][7] += y2;
        }
      }
      return this;
    }
    parse(d = "M0 0") {
      if (Array.isArray(d)) d = Array.prototype.concat.apply([], d).toString();
      return pathParser(d);
    }
    size(width2, height2) {
      const box = this.bbox();
      let i, l;
      box.width = box.width === 0 ? 1 : box.width;
      box.height = box.height === 0 ? 1 : box.height;
      for (i = this.length - 1; i >= 0; i--) {
        l = this[i][0];
        if (l === "M" || l === "L" || l === "T") {
          this[i][1] = (this[i][1] - box.x) * width2 / box.width + box.x;
          this[i][2] = (this[i][2] - box.y) * height2 / box.height + box.y;
        } else if (l === "H") this[i][1] = (this[i][1] - box.x) * width2 / box.width + box.x;
        else if (l === "V") this[i][1] = (this[i][1] - box.y) * height2 / box.height + box.y;
        else if (l === "C" || l === "S" || l === "Q") {
          this[i][1] = (this[i][1] - box.x) * width2 / box.width + box.x;
          this[i][2] = (this[i][2] - box.y) * height2 / box.height + box.y;
          this[i][3] = (this[i][3] - box.x) * width2 / box.width + box.x;
          this[i][4] = (this[i][4] - box.y) * height2 / box.height + box.y;
          if (l === "C") {
            this[i][5] = (this[i][5] - box.x) * width2 / box.width + box.x;
            this[i][6] = (this[i][6] - box.y) * height2 / box.height + box.y;
          }
        } else if (l === "A") {
          this[i][1] = this[i][1] * width2 / box.width;
          this[i][2] = this[i][2] * height2 / box.height;
          this[i][6] = (this[i][6] - box.x) * width2 / box.width + box.x;
          this[i][7] = (this[i][7] - box.y) * height2 / box.height + box.y;
        }
      }
      return this;
    }
    toString() {
      return arrayToString(this);
    }
  };
  var getClassForType = (value) => {
    const type = typeof value;
    if (type === "number") return SVGNumber;
    else if (type === "string") if (Color.isColor(value)) return Color;
    else if (delimiter.test(value)) return isPathLetter.test(value) ? PathArray : SVGArray;
    else if (numberAndUnit.test(value)) return SVGNumber;
    else return NonMorphable;
    else if (morphableTypes.indexOf(value.constructor) > -1) return value.constructor;
    else if (Array.isArray(value)) return SVGArray;
    else if (type === "object") return ObjectBag;
    else return NonMorphable;
  };
  var Morphable = class {
    constructor(stepper) {
      this._stepper = stepper || new Ease("-");
      this._from = null;
      this._to = null;
      this._type = null;
      this._context = null;
      this._morphObj = null;
    }
    at(pos) {
      return this._morphObj.morph(this._from, this._to, pos, this._stepper, this._context);
    }
    done() {
      return this._context.map(this._stepper.done).reduce(function(last, curr) {
        return last && curr;
      }, true);
    }
    from(val) {
      if (val == null) return this._from;
      this._from = this._set(val);
      return this;
    }
    stepper(stepper) {
      if (stepper == null) return this._stepper;
      this._stepper = stepper;
      return this;
    }
    to(val) {
      if (val == null) return this._to;
      this._to = this._set(val);
      return this;
    }
    type(type) {
      if (type == null) return this._type;
      this._type = type;
      return this;
    }
    _set(value) {
      if (!this._type) this.type(getClassForType(value));
      let result = new this._type(value);
      if (this._type === Color) result = this._to ? result[this._to[4]]() : this._from ? result[this._from[4]]() : result;
      if (this._type === ObjectBag) result = this._to ? result.align(this._to) : this._from ? result.align(this._from) : result;
      result = result.toConsumable();
      this._morphObj = this._morphObj || new this._type();
      this._context = this._context || Array.apply(null, Array(result.length)).map(Object).map(function(o) {
        o.done = true;
        return o;
      });
      return result;
    }
  };
  var NonMorphable = class {
    constructor(...args) {
      this.init(...args);
    }
    init(val) {
      val = Array.isArray(val) ? val[0] : val;
      this.value = val;
      return this;
    }
    toArray() {
      return [this.value];
    }
    valueOf() {
      return this.value;
    }
  };
  var TransformBag = class TransformBag2 {
    constructor(...args) {
      this.init(...args);
    }
    init(obj) {
      if (Array.isArray(obj)) obj = {
        scaleX: obj[0],
        scaleY: obj[1],
        shear: obj[2],
        rotate: obj[3],
        translateX: obj[4],
        translateY: obj[5],
        originX: obj[6],
        originY: obj[7]
      };
      Object.assign(this, TransformBag2.defaults, obj);
      return this;
    }
    toArray() {
      const v = this;
      return [
        v.scaleX,
        v.scaleY,
        v.shear,
        v.rotate,
        v.translateX,
        v.translateY,
        v.originX,
        v.originY
      ];
    }
  };
  TransformBag.defaults = {
    scaleX: 1,
    scaleY: 1,
    shear: 0,
    rotate: 0,
    translateX: 0,
    translateY: 0,
    originX: 0,
    originY: 0
  };
  var sortByKey = (a, b) => {
    return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
  };
  var ObjectBag = class {
    constructor(...args) {
      this.init(...args);
    }
    align(other) {
      const values = this.values;
      for (let i = 0, il = values.length; i < il; ++i) {
        if (values[i + 1] === other[i + 1]) {
          if (values[i + 1] === Color && other[i + 7] !== values[i + 7]) {
            const space = other[i + 7];
            const color = new Color(this.values.splice(i + 3, 5))[space]().toArray();
            this.values.splice(i + 3, 0, ...color);
          }
          i += values[i + 2] + 2;
          continue;
        }
        if (!other[i + 1]) return this;
        const defaultObject = new other[i + 1]().toArray();
        const toDelete = values[i + 2] + 3;
        values.splice(i, toDelete, other[i], other[i + 1], other[i + 2], ...defaultObject);
        i += values[i + 2] + 2;
      }
      return this;
    }
    init(objOrArr) {
      this.values = [];
      if (Array.isArray(objOrArr)) {
        this.values = objOrArr.slice();
        return;
      }
      objOrArr = objOrArr || {};
      const entries = [];
      for (const i in objOrArr) {
        const Type = getClassForType(objOrArr[i]);
        const val = new Type(objOrArr[i]).toArray();
        entries.push([
          i,
          Type,
          val.length,
          ...val
        ]);
      }
      entries.sort(sortByKey);
      this.values = entries.reduce((last, curr) => last.concat(curr), []);
      return this;
    }
    toArray() {
      return this.values;
    }
    valueOf() {
      const obj = {};
      const arr = this.values;
      while (arr.length) {
        const key = arr.shift();
        const Type = arr.shift();
        const num = arr.shift();
        obj[key] = new Type(arr.splice(0, num));
      }
      return obj;
    }
  };
  var morphableTypes = [
    NonMorphable,
    TransformBag,
    ObjectBag
  ];
  function registerMorphableType(type = []) {
    morphableTypes.push(...[].concat(type));
  }
  function makeMorphable() {
    extend(morphableTypes, {
      to(val) {
        return new Morphable().type(this.constructor).from(this.toArray()).to(val);
      },
      fromArray(arr) {
        this.init(arr);
        return this;
      },
      toConsumable() {
        return this.toArray();
      },
      morph(from2, to2, pos, stepper, context) {
        const mapper = function(i, index) {
          return stepper.step(i, to2[index], pos, context[index], context);
        };
        return this.fromArray(from2.map(mapper));
      }
    });
  }
  var Path = class extends Shape {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("path", node), attrs2);
    }
    array() {
      return this._array || (this._array = new PathArray(this.attr("d")));
    }
    clear() {
      delete this._array;
      return this;
    }
    height(height2) {
      return height2 == null ? this.bbox().height : this.size(this.bbox().width, height2);
    }
    move(x2, y2) {
      return this.attr("d", this.array().move(x2, y2));
    }
    plot(d) {
      return d == null ? this.array() : this.clear().attr("d", typeof d === "string" ? d : this._array = new PathArray(d));
    }
    size(width2, height2) {
      const p = proportionalSize(this, width2, height2);
      return this.attr("d", this.array().size(p.width, p.height));
    }
    width(width2) {
      return width2 == null ? this.bbox().width : this.size(width2, this.bbox().height);
    }
    x(x2) {
      return x2 == null ? this.bbox().x : this.move(x2, this.bbox().y);
    }
    y(y2) {
      return y2 == null ? this.bbox().y : this.move(this.bbox().x, y2);
    }
  };
  Path.prototype.MorphArray = PathArray;
  registerMethods({ Container: { path: wrapWithAttrCheck(function(d) {
    return this.put(new Path()).plot(d || new PathArray());
  }) } });
  register(Path, "Path");
  var poly_exports = /* @__PURE__ */ __exportAll({
    array: () => array,
    clear: () => clear,
    move: () => move$2,
    plot: () => plot,
    size: () => size$1
  });
  function array() {
    return this._array || (this._array = new PointArray(this.attr("points")));
  }
  function clear() {
    delete this._array;
    return this;
  }
  function move$2(x2, y2) {
    return this.attr("points", this.array().move(x2, y2));
  }
  function plot(p) {
    return p == null ? this.array() : this.clear().attr("points", typeof p === "string" ? p : this._array = new PointArray(p));
  }
  function size$1(width2, height2) {
    const p = proportionalSize(this, width2, height2);
    return this.attr("points", this.array().size(p.width, p.height));
  }
  var Polygon = class extends Shape {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("polygon", node), attrs2);
    }
  };
  registerMethods({ Container: { polygon: wrapWithAttrCheck(function(p) {
    return this.put(new Polygon()).plot(p || new PointArray());
  }) } });
  extend(Polygon, pointed_exports);
  extend(Polygon, poly_exports);
  register(Polygon, "Polygon");
  var Polyline = class extends Shape {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("polyline", node), attrs2);
    }
  };
  registerMethods({ Container: { polyline: wrapWithAttrCheck(function(p) {
    return this.put(new Polyline()).plot(p || new PointArray());
  }) } });
  extend(Polyline, pointed_exports);
  extend(Polyline, poly_exports);
  register(Polyline, "Polyline");
  var Rect = class extends Shape {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("rect", node), attrs2);
    }
  };
  extend(Rect, {
    rx,
    ry
  });
  registerMethods({ Container: { rect: wrapWithAttrCheck(function(width2, height2) {
    return this.put(new Rect()).size(width2, height2);
  }) } });
  register(Rect, "Rect");
  var Queue = class {
    constructor() {
      this._first = null;
      this._last = null;
    }
    first() {
      return this._first && this._first.value;
    }
    last() {
      return this._last && this._last.value;
    }
    push(value) {
      const item = typeof value.next !== "undefined" ? value : {
        value,
        next: null,
        prev: null
      };
      if (this._last) {
        item.prev = this._last;
        this._last.next = item;
        this._last = item;
      } else {
        this._last = item;
        this._first = item;
      }
      return item;
    }
    remove(item) {
      if (item.prev) item.prev.next = item.next;
      if (item.next) item.next.prev = item.prev;
      if (item === this._last) this._last = item.prev;
      if (item === this._first) this._first = item.next;
      item.prev = null;
      item.next = null;
    }
    shift() {
      const remove = this._first;
      if (!remove) return null;
      this._first = remove.next;
      if (this._first) this._first.prev = null;
      this._last = this._first ? this._last : null;
      return remove.value;
    }
  };
  var Animator = {
    nextDraw: null,
    frames: new Queue(),
    timeouts: new Queue(),
    immediates: new Queue(),
    timer: () => globals.window.performance || globals.window.Date,
    frame(fn) {
      const node = Animator.frames.push({ run: fn });
      if (Animator.nextDraw === null) Animator.nextDraw = globals.window.requestAnimationFrame(Animator._draw);
      return node;
    },
    timeout(fn, delay) {
      delay = delay || 0;
      const time = Animator.timer().now() + delay;
      const node = Animator.timeouts.push({
        run: fn,
        time
      });
      if (Animator.nextDraw === null) Animator.nextDraw = globals.window.requestAnimationFrame(Animator._draw);
      return node;
    },
    immediate(fn) {
      const node = Animator.immediates.push(fn);
      if (Animator.nextDraw === null) Animator.nextDraw = globals.window.requestAnimationFrame(Animator._draw);
      return node;
    },
    cancelFrame(node) {
      node != null && Animator.frames.remove(node);
    },
    clearTimeout(node) {
      node != null && Animator.timeouts.remove(node);
    },
    cancelImmediate(node) {
      node != null && Animator.immediates.remove(node);
    },
    _draw(now) {
      try {
        let nextTimeout = null;
        const lastTimeout = Animator.timeouts.last();
        while (nextTimeout = Animator.timeouts.shift()) {
          if (now >= nextTimeout.time) nextTimeout.run();
          else Animator.timeouts.push(nextTimeout);
          if (nextTimeout === lastTimeout) break;
        }
        let nextFrame = null;
        const lastFrame = Animator.frames.last();
        while (nextFrame !== lastFrame && (nextFrame = Animator.frames.shift())) nextFrame.run(now);
        let nextImmediate = null;
        while (nextImmediate = Animator.immediates.shift()) nextImmediate();
      } finally {
        const pending = Animator.timeouts.first() || Animator.frames.first() || Animator.immediates.first();
        Animator.nextDraw = pending ? globals.window.requestAnimationFrame(Animator._draw) : null;
      }
    }
  };
  var makeSchedule = function(runnerInfo) {
    const start = runnerInfo.start;
    const duration = runnerInfo.runner.duration();
    return {
      start,
      duration,
      end: start + duration,
      runner: runnerInfo.runner
    };
  };
  var defaultSource = function() {
    const w = globals.window;
    return (w.performance || w.Date).now();
  };
  var Timeline = class extends EventTarget {
    constructor(timeSource = defaultSource) {
      super();
      this._timeSource = timeSource;
      this.terminate();
    }
    active() {
      return !!this._nextFrame;
    }
    finish() {
      this._finishing = true;
      try {
        this.time(this.getEndTimeOfTimeline() + 1);
      } finally {
        this._finishing = false;
      }
      return this.pause();
    }
    getEndTime() {
      const lastRunnerInfo = this.getLastRunnerInfo();
      const lastDuration = lastRunnerInfo ? lastRunnerInfo.runner.duration() : 0;
      return (lastRunnerInfo ? lastRunnerInfo.start : this._time) + lastDuration;
    }
    getEndTimeOfTimeline() {
      const endTimes = this._runners.map((i) => i.start + i.runner.duration());
      return Math.max(0, ...endTimes);
    }
    getLastRunnerInfo() {
      return this.getRunnerInfoById(this._lastRunnerId);
    }
    getRunnerInfoById(id) {
      return this._runners[this._runnerIds.indexOf(id)] || null;
    }
    pause() {
      this._paused = true;
      return this._continue();
    }
    persist(dtOrForever) {
      if (dtOrForever == null) return this._persist;
      this._persist = dtOrForever;
      return this;
    }
    play() {
      this._paused = false;
      return this.updateTime()._continue();
    }
    reverse(yes) {
      const currentSpeed = this.speed();
      if (yes == null) return this.speed(-currentSpeed);
      const positive = Math.abs(currentSpeed);
      return this.speed(yes ? -positive : positive);
    }
    schedule(runner, delay, when) {
      if (runner == null) return this._runners.map(makeSchedule);
      let absoluteStartTime = 0;
      const endTime = this.getEndTime();
      delay = delay || 0;
      if (when == null || when === "last" || when === "after") absoluteStartTime = endTime;
      else if (when === "absolute" || when === "start") {
        absoluteStartTime = delay;
        delay = 0;
      } else if (when === "now") absoluteStartTime = this._time;
      else if (when === "relative") {
        const runnerInfo2 = this.getRunnerInfoById(runner.id);
        if (runnerInfo2) {
          absoluteStartTime = runnerInfo2.start + delay;
          delay = 0;
        }
      } else if (when === "with-last") {
        const lastRunnerInfo = this.getLastRunnerInfo();
        absoluteStartTime = lastRunnerInfo ? lastRunnerInfo.start : this._time;
      } else throw new Error('Invalid value for the "when" parameter');
      runner.unschedule();
      runner.timeline(this);
      runner._retired = false;
      const persist = runner.persist();
      const runnerInfo = {
        persist: persist === null ? this._persist : persist,
        start: absoluteStartTime + delay,
        runner
      };
      this._lastRunnerId = runner.id;
      runner._runnerInfo = runnerInfo;
      this._runners.push(runnerInfo);
      this._runners.sort((a, b) => a.start - b.start);
      this._runnerIds = this._runners.map((info) => info.runner.id);
      this.updateTime()._continue();
      return this;
    }
    seek(dt) {
      return this.time(this._time + dt);
    }
    source(fn) {
      if (fn == null) return this._timeSource;
      this._timeSource = fn;
      return this;
    }
    speed(speed) {
      if (speed == null) return this._speed;
      this._speed = speed;
      return this;
    }
    stop() {
      this.time(0);
      return this.pause();
    }
    time(time) {
      if (time == null) return this._time;
      this._time = time;
      return this._continue(true);
    }
    unschedule(runner) {
      const index = this._runnerIds.indexOf(runner.id);
      if (index < 0) return this;
      this._runners.splice(index, 1);
      this._runnerIds.splice(index, 1);
      runner.timeline(null);
      runner._runnerInfo = null;
      runner._retired = true;
      return this;
    }
    updateTime() {
      if (!this.active()) this._lastSourceTime = this._timeSource();
      return this;
    }
    _continue(immediateStep = false) {
      Animator.cancelFrame(this._nextFrame);
      this._nextFrame = null;
      if (immediateStep) return this._stepImmediate();
      if (this._paused) return this;
      this._nextFrame = Animator.frame(this._step);
      return this;
    }
    _stepFn(immediateStep = false) {
      const generation = this._generation;
      const time = this._timeSource();
      let dtSource = time - this._lastSourceTime;
      if (immediateStep) dtSource = 0;
      const dtTime = this._speed * dtSource + (this._time - this._lastStepTime);
      this._lastSourceTime = time;
      if (!immediateStep) {
        this._time += dtTime;
        this._time = this._time < 0 ? 0 : this._time;
      }
      this._lastStepTime = this._time;
      this.fire("time", this._time);
      const scheduled = this._runners.slice();
      for (let k = scheduled.length; k--; ) {
        const runnerInfo = scheduled[k];
        if (runnerInfo.runner._runnerInfo !== runnerInfo) continue;
        const runner = runnerInfo.runner;
        if (this._time - runnerInfo.start < 0) runner.reset(true);
      }
      let runnersLeft = false;
      for (const runnerInfo of this._runners.slice()) {
        if (runnerInfo.runner._runnerInfo !== runnerInfo) continue;
        const runner = runnerInfo.runner;
        let dt = dtTime;
        const dtToStart = this._time - runnerInfo.start;
        if (dtToStart < 0) {
          runnersLeft = true;
          continue;
        } else if (dtToStart === 0) {
          runner.reset();
          runnersLeft = true;
          continue;
        } else if (dtToStart < dt) dt = dtToStart;
        if (!runner.active()) continue;
        const finished = (this._finishing && runner._isDeclarative ? runner.finish() : runner.step(dt)).done;
        if (runner._runnerInfo !== runnerInfo) continue;
        if (!finished) runnersLeft = true;
        else if (runnerInfo.persist !== true) {
          if (runner.duration() - runner.time() + this._time + runnerInfo.persist <= this._time) runner.unschedule();
        }
      }
      if (generation !== this._generation) return this;
      if (!runnersLeft) runnersLeft = this._runners.some(({ start, runner }) => start >= this._time || runner.active() && !runner.done);
      if (runnersLeft && !(this._speed < 0 && this._time === 0) || this._runnerIds.length && this._speed < 0 && this._time > 0) this._continue();
      else {
        this.pause();
        this.fire("finished");
      }
      return this;
    }
    terminate() {
      Animator.cancelFrame(this._nextFrame);
      this._generation = (this._generation || 0) + 1;
      this._startTime = 0;
      this._speed = 1;
      this._persist = 0;
      for (const { runner } of this._runners || []) {
        runner._retired = true;
        runner._runnerInfo = null;
      }
      this._nextFrame = null;
      this._paused = true;
      this._finishing = false;
      this._runners = [];
      this._runnerIds = [];
      this._lastRunnerId = -1;
      this._time = 0;
      this._lastSourceTime = 0;
      this._lastStepTime = 0;
      this._step = this._stepFn.bind(this, false);
      this._stepImmediate = this._stepFn.bind(this, true);
    }
  };
  registerMethods({ Element: { timeline: function(timeline2) {
    if (timeline2 == null) {
      this._timeline = this._timeline || new Timeline();
      return this._timeline;
    } else {
      this._timeline = timeline2;
      return this;
    }
  } } });
  var Runner = class Runner2 extends EventTarget {
    constructor(options) {
      super();
      this.id = Runner2.id++;
      options = options == null ? timeline.duration : options;
      options = typeof options === "function" ? new Controller(options) : options;
      this._element = null;
      this._timeline = null;
      this._runnerInfo = null;
      this.done = false;
      this._queue = [];
      this._duration = typeof options === "number" && options;
      this._isDeclarative = options instanceof Controller;
      this._stepper = this._isDeclarative ? options : new Ease();
      this._history = {};
      this.enabled = true;
      this._time = 0;
      this._lastTime = 0;
      this._reseted = true;
      this.transforms = new Matrix();
      this._isAbsoluteTransform = false;
      this._hasTransform = false;
      this._transformInitialised = false;
      this._transformActive = false;
      this._retired = false;
      this._reverse = false;
      this._swing = false;
      this._wait = 0;
      this._times = 1;
      this._persist = this._isDeclarative ? true : null;
    }
    static sanitise(duration, delay, when) {
      let times = 1;
      let swing = false;
      let wait = 0;
      duration = duration ?? timeline.duration;
      delay = delay ?? timeline.delay;
      when = when || "last";
      if (typeof duration === "object" && !(duration instanceof Stepper)) {
        delay = duration.delay ?? delay;
        when = duration.when ?? when;
        swing = duration.swing || swing;
        times = duration.times ?? times;
        wait = duration.wait ?? wait;
        duration = duration.duration ?? timeline.duration;
      }
      return {
        duration,
        delay,
        swing,
        times,
        wait,
        when
      };
    }
    active(enabled) {
      if (enabled == null) return this.enabled;
      this.enabled = enabled;
      return this;
    }
    addTransform(transform2) {
      this.transforms.lmultiplyO(transform2);
      this._transformInitialised = true;
      this._transformActive = true;
      return this;
    }
    after(fn) {
      return this.on("finished", fn);
    }
    animate(duration, delay, when) {
      const o = Runner2.sanitise(duration, delay, when);
      const runner = new Runner2(o.duration);
      if (this._timeline) runner.timeline(this._timeline);
      if (this._element) runner.element(this._element);
      return runner.loop(o).schedule(o.delay, o.when);
    }
    clearTransform() {
      this.transforms = new Matrix();
      return this;
    }
    delay(delay) {
      return this.animate(0, delay);
    }
    duration() {
      return this._times * (this._wait + this._duration) - this._wait;
    }
    during(fn) {
      return this.queue(null, fn);
    }
    ease(fn) {
      this._stepper = new Ease(fn);
      return this;
    }
    element(element) {
      if (element == null) return this._element;
      this._element = element;
      element._prepareRunner();
      return this;
    }
    finish() {
      if (!this._isDeclarative) return this.time(this.duration());
      const time = this._time;
      this.step(Infinity);
      this._time = time;
      return this;
    }
    loop(times, swing, wait) {
      if (typeof times === "object") {
        swing = times.swing;
        wait = times.wait;
        times = times.times;
      }
      this._times = times || Infinity;
      this._swing = swing || false;
      this._wait = wait || 0;
      if (this._times === true) this._times = Infinity;
      return this;
    }
    loops(p) {
      const loopDuration = this._duration + this._wait;
      if (p == null) {
        const loopsDone = Math.floor(this._time / loopDuration);
        const position2 = (this._time - loopsDone * loopDuration) / this._duration;
        return Math.min(loopsDone + position2, this._times);
      }
      const whole = Math.floor(p);
      const partial = p % 1;
      const time = loopDuration * whole + this._duration * partial;
      return this.time(time);
    }
    persist(dtOrForever) {
      if (dtOrForever == null) return this._persist;
      this._persist = dtOrForever;
      return this;
    }
    position(p) {
      const x2 = this._time;
      const d = this._duration;
      const w = this._wait;
      const t = this._times;
      const s = this._swing;
      const r = this._reverse;
      let position2;
      if (p == null) {
        const f = function(x3) {
          const swinging = s * Math.floor(x3 % (2 * (w + d)) / (w + d));
          const backwards = swinging && !r || !swinging && r;
          const uncliped = Math.pow(-1, backwards) * (x3 % (w + d)) / d + backwards;
          return Math.max(Math.min(uncliped, 1), 0);
        };
        const endTime = t * (w + d) - w;
        position2 = x2 <= 0 ? Math.round(f(1e-5)) : x2 < endTime ? f(x2) : Math.round(f(endTime - 1e-5));
        return position2;
      }
      const loopsDone = Math.floor(this.loops());
      const swingForward = s && loopsDone % 2 === 0;
      position2 = loopsDone + (swingForward && !r || r && swingForward ? p : 1 - p);
      return this.loops(position2);
    }
    progress(p) {
      if (p == null) return Math.min(1, this._time / this.duration());
      return this.time(p * this.duration());
    }
    queue(initFn, runFn, retargetFn, isTransform) {
      if (this._isDeclarative) this.done = false;
      this._queue.push({
        initialiser: initFn || noop,
        runner: runFn || noop,
        retarget: retargetFn,
        isTransform,
        initialised: false,
        finished: false
      });
      this.timeline() && this.timeline()._continue();
      return this;
    }
    reset(deactivateTransform = false) {
      if (this._reseted) {
        const transformActive = !deactivateTransform && this._hasTransform && this.position() !== 0;
        if (transformActive && !this._transformInitialised) {
          this.step(0);
          this._reseted = true;
          return this;
        }
        if (transformActive !== this._transformActive) {
          this._transformActive = transformActive;
          this._element && this._element._addRunner(this);
        }
        return this;
      }
      if (!this._reseted) {
        this.time(0);
        this._reseted = true;
      }
      if (deactivateTransform && this._transformActive) {
        this._transformActive = false;
        this._element && this._element._addRunner(this);
      }
      return this;
    }
    reverse(reverse) {
      this._reverse = reverse == null ? !this._reverse : reverse;
      return this;
    }
    schedule(timeline2, delay, when) {
      if (!(timeline2 instanceof Timeline)) {
        when = delay;
        delay = timeline2;
        timeline2 = this.timeline();
      }
      if (!timeline2) throw Error("Runner cannot be scheduled without timeline");
      timeline2.schedule(this, delay, when);
      return this;
    }
    step(dt) {
      if (!this.enabled) return this;
      const wasDone = this.done;
      dt = dt == null ? 16 : dt;
      this._time += dt;
      const position2 = this.position();
      const running = this._lastPosition !== position2 && this._time >= 0;
      this._lastPosition = position2;
      const duration = this.duration();
      const justStarted = this._lastTime <= 0 && this._time > 0;
      this._lastTime = this._time;
      if (justStarted) this.fire("start", this);
      const declarative = this._isDeclarative;
      this.done = !declarative && this._time >= duration;
      this._reseted = false;
      const transformActive = this._hasTransform && (this._time > 0 || position2 !== 0);
      this._transformActive = transformActive;
      let converged = false;
      if (running || declarative) {
        this._initialise(running);
        this.transforms = new Matrix();
        converged = this._run(declarative ? dt : position2);
        this._transformActive = transformActive;
        this.fire("step", this);
      }
      this.done = this.done || converged && declarative;
      if (this.done && !wasDone) this.fire("finished", this);
      return this;
    }
    time(time) {
      if (time == null) return this._time;
      const dt = time - this._time;
      this.step(dt);
      return this;
    }
    timeline(timeline2) {
      if (typeof timeline2 === "undefined") return this._timeline;
      this._timeline = timeline2;
      return this;
    }
    unschedule() {
      const timeline2 = this.timeline();
      timeline2 && timeline2.unschedule(this);
      return this;
    }
    _initialise(running) {
      if (!running && !this._isDeclarative) return;
      for (let i = 0, len = this._queue.length; i < len; ++i) {
        const current = this._queue[i];
        const needsIt = this._isDeclarative || !current.initialised && running;
        running = !current.finished;
        if (needsIt && running) {
          current.initialiser.call(this);
          current.initialised = true;
        }
      }
    }
    _rememberMorpher(method, morpher) {
      this._history[method] = {
        morpher,
        caller: this._queue[this._queue.length - 1]
      };
      if (this._isDeclarative) {
        const timeline2 = this.timeline();
        timeline2 && timeline2.play();
      }
    }
    _run(positionOrDt) {
      let allfinished = true;
      for (let i = 0, len = this._queue.length; i < len; ++i) {
        const current = this._queue[i];
        if (this._isDeclarative && current.finished && !current.isTransform) continue;
        const converged = current.runner.call(this, positionOrDt);
        current.finished = current.finished || converged === true;
        allfinished = allfinished && current.finished;
      }
      return allfinished;
    }
    _tryRetarget(method, target, extra) {
      if (this._history[method]) {
        if (!this._history[method].caller.initialised) {
          const index = this._queue.indexOf(this._history[method].caller);
          this._queue.splice(index, 1);
          return false;
        }
        if (this._history[method].caller.retarget) this._history[method].caller.retarget.call(this, target, extra);
        else this._history[method].morpher.to(target);
        this._history[method].caller.finished = false;
        if (this._isDeclarative) this.done = false;
        const timeline2 = this.timeline();
        timeline2 && timeline2.play();
        return true;
      }
      return false;
    }
  };
  Runner.id = 0;
  var FakeRunner = class {
    constructor(transforms2 = new Matrix(), id = -1, done = true, isAbsoluteTransform = false) {
      this.transforms = transforms2;
      this.id = id;
      this.done = done;
      this._isAbsoluteTransform = isAbsoluteTransform;
      this._transformActive = true;
      this._retired = true;
    }
  };
  extend([Runner, FakeRunner], { mergeWith(runner) {
    return new FakeRunner(this._isAbsoluteTransform ? this.transforms : runner.transforms.lmultiply(this.transforms), runner.id, true, runner._isAbsoluteTransform || this._isAbsoluteTransform);
  } });
  var lmultiply = (last, curr) => last.lmultiplyO(curr);
  var getRunnerTransform = (runner) => runner.transforms;
  var isActiveTransform = (runner) => runner._transformActive;
  function activeTransformRunners(runners) {
    const activeRunners = runners.filter(isActiveTransform);
    let firstRunner = 0;
    for (let i = 0; i < activeRunners.length; ++i) if (activeRunners[i]._isAbsoluteTransform) firstRunner = i;
    return activeRunners.slice(firstRunner);
  }
  function mergeTransforms() {
    const netTransform = activeTransformRunners(this._transformationRunners.runners).map(getRunnerTransform).reduce(lmultiply, new Matrix());
    this.transform(netTransform);
    this._transformationRunners.merge();
    if (this._transformationRunners.length() === 1) this._frameId = null;
  }
  var RunnerArray = class {
    constructor() {
      this.runners = [];
    }
    add(runner) {
      var _context;
      if ((0, import_includes.default)(_context = this.runners).call(_context, runner)) return;
      this.runners.push(runner);
      return this;
    }
    edit(id, newRunner) {
      const index = this.runners.findIndex((runner) => runner.id === id);
      if (index >= 0) this.runners.splice(index, 1, newRunner);
      return this;
    }
    getByID(id) {
      return this.runners.find((runner) => runner.id === id);
    }
    length() {
      return this.runners.length;
    }
    merge() {
      let lastRunner = null;
      for (let i = 0; i < this.runners.length; ++i) {
        const runner = this.runners[i];
        if (lastRunner && runner.done && lastRunner.done && runner._retired && lastRunner._retired) {
          this.remove(runner.id);
          const newRunner = runner.mergeWith(lastRunner);
          this.edit(lastRunner.id, newRunner);
          lastRunner = newRunner;
          --i;
        } else lastRunner = runner;
      }
      return this;
    }
    remove(id) {
      const index = this.runners.findIndex((runner) => runner.id === id);
      if (index >= 0) this.runners.splice(index, 1);
      return this;
    }
  };
  registerMethods({ Element: {
    animate(duration, delay, when) {
      const o = Runner.sanitise(duration, delay, when);
      const timeline2 = this.timeline();
      return new Runner(o.duration).loop(o).element(this).timeline(timeline2.play()).schedule(o.delay, o.when);
    },
    delay(by, when) {
      return this.animate(0, by, when);
    },
    _currentTransform(current) {
      const runners = this._transformationRunners.runners;
      const currentIndex = runners.indexOf(current);
      return activeTransformRunners(runners.slice(0, currentIndex + 1)).map(getRunnerTransform).reduce(lmultiply, new Matrix());
    },
    _addRunner(runner) {
      if (this._transformationRunners.length() === 1 && this._transformationRunners.runners[0].id === -1) this._transformationRunners.runners[0].transforms = new Matrix(this);
      this._transformationRunners.add(runner);
      Animator.cancelImmediate(this._frameId);
      this._frameId = Animator.immediate(mergeTransforms.bind(this));
    },
    _prepareRunner() {
      if (this._frameId == null) this._transformationRunners = new RunnerArray().add(new FakeRunner(new Matrix(this)));
    }
  } });
  var difference = (a, b) => a.filter((x2) => !(0, import_includes.default)(b).call(b, x2));
  extend(Runner, {
    attr(a, v) {
      return this.styleAttr("attr", a, v);
    },
    css(s, v) {
      return this.styleAttr("css", s, v);
    },
    styleAttr(type, nameOrAttrs, val) {
      if (typeof nameOrAttrs === "string") return this.styleAttr(type, { [nameOrAttrs]: val });
      const attrs2 = nameOrAttrs;
      const history = this._history[type];
      if (history && !history.caller.initialised && history.caller.retarget) {
        history.caller.retarget.call(this, attrs2);
        return this;
      }
      if (this._tryRetarget(type, attrs2)) return this;
      let morpher = new Morphable(this._stepper).to(attrs2);
      let keys = Object.keys(attrs2);
      this.queue(function() {
        morpher = morpher.from(this.element()[type](keys));
      }, function(pos) {
        this.element()[type](morpher.at(pos).valueOf());
        return morpher.done();
      }, function(newToAttrs) {
        const differences = difference(Object.keys(newToAttrs), keys);
        if (differences.length && morpher.from() != null) {
          const addedFromAttrs = this.element()[type](differences);
          const oldFromAttrs = new ObjectBag(morpher.from()).valueOf();
          Object.assign(oldFromAttrs, addedFromAttrs);
          morpher.from(oldFromAttrs);
        }
        const mergedToAttrs = new ObjectBag(morpher.to()).valueOf();
        Object.assign(mergedToAttrs, newToAttrs);
        morpher.to(mergedToAttrs);
        keys = Object.keys(mergedToAttrs);
      });
      this._rememberMorpher(type, morpher);
      return this;
    },
    zoom(level, point2) {
      if (this._tryRetarget("zoom", level, point2)) return this;
      let morpher = new Morphable(this._stepper).to(new SVGNumber(level));
      this.queue(function() {
        morpher = morpher.from(this.element().zoom());
      }, function(pos) {
        this.element().zoom(morpher.at(pos), point2);
        return morpher.done();
      }, function(newLevel, newPoint) {
        point2 = newPoint;
        morpher.to(newLevel);
      });
      this._rememberMorpher("zoom", morpher);
      return this;
    },
    /**
    ** absolute transformations
    **/
    transform(transforms2, relative, affine) {
      relative = transforms2.relative || relative;
      this._hasTransform = true;
      this._isAbsoluteTransform = this._isAbsoluteTransform || !relative;
      if (this._isDeclarative && !relative && this._tryRetarget("transform", transforms2)) return this;
      const isMatrix = Matrix.isMatrixLike(transforms2);
      affine = transforms2.affine != null ? transforms2.affine : affine != null ? affine : !isMatrix;
      const morpher = new Morphable(this._stepper).type(affine ? TransformBag : Matrix);
      const matrixMorpher = affine ? new Morphable(this._stepper).type(Matrix) : morpher;
      let origin;
      let element;
      let current;
      let currentAngle;
      let startTransform;
      function setup() {
        element = element || this.element();
        origin = origin || getOrigin(transforms2, element);
        startTransform = new Matrix(relative ? void 0 : element);
        element._addRunner(this);
      }
      function run(pos) {
        if (!relative) this.clearTransform();
        const { x: x2, y: y2 } = new Point(origin).transform(element._currentTransform(this));
        const targetTransforms = {
          ...transforms2,
          origin: [x2, y2]
        };
        if (targetTransforms.relative === true) delete targetTransforms.relative;
        let target = new Matrix(targetTransforms);
        let start = this._isDeclarative && current ? current : startTransform;
        let activeMorpher = morpher;
        if (affine) {
          const targetParameters = target.decompose(x2, y2);
          const startParameters = start.decompose(x2, y2);
          if (!new TransformBag(targetParameters).toArray().concat(new TransformBag(startParameters).toArray()).every(Number.isFinite)) activeMorpher = matrixMorpher;
          else {
            target = targetParameters;
            start = startParameters;
            const rTarget = target.rotate;
            const rCurrent = start.rotate;
            const possibilities = [
              rTarget - 360,
              rTarget,
              rTarget + 360
            ];
            const distances = possibilities.map((a) => Math.abs(a - rCurrent));
            const shortest = Math.min(...distances);
            const index = distances.indexOf(shortest);
            target.rotate = possibilities[index];
          }
        }
        if (relative && activeMorpher === morpher) {
          if (!isMatrix) target.rotate = transforms2.rotate || 0;
          if (this._isDeclarative && currentAngle) start.rotate = currentAngle;
        }
        activeMorpher.from(start);
        activeMorpher.to(target);
        const affineParameters = activeMorpher.at(pos);
        currentAngle = affineParameters.rotate;
        current = new Matrix(affineParameters);
        this.addTransform(current);
        element._addRunner(this);
        return activeMorpher.done();
      }
      function retarget(newTransforms) {
        origin = getOrigin(newTransforms, element);
        transforms2 = { ...newTransforms };
      }
      this.queue(setup, run, retarget, true);
      this._isDeclarative && this._rememberMorpher("transform", morpher);
      return this;
    },
    x(x2) {
      return this._queueNumber("x", x2);
    },
    y(y2) {
      return this._queueNumber("y", y2);
    },
    ax(x2) {
      return this._queueNumber("ax", x2);
    },
    ay(y2) {
      return this._queueNumber("ay", y2);
    },
    dx(x2 = 0) {
      return this._queueNumberDelta("x", x2);
    },
    dy(y2 = 0) {
      return this._queueNumberDelta("y", y2);
    },
    dmove(x2, y2) {
      return this.dx(x2).dy(y2);
    },
    _queueNumberDelta(method, to2) {
      to2 = new SVGNumber(to2);
      if (this._tryRetarget(method, to2)) return this;
      const morpher = new Morphable(this._stepper).to(to2);
      let from2 = null;
      this.queue(function() {
        from2 = this.element()[method]();
        morpher.from(from2);
        morpher.to(from2 + to2);
      }, function(pos) {
        this.element()[method](morpher.at(pos));
        return morpher.done();
      }, function(newTo) {
        morpher.to(from2 + new SVGNumber(newTo));
      });
      this._rememberMorpher(method, morpher);
      return this;
    },
    _queueObject(method, to2) {
      if (this._tryRetarget(method, to2)) return this;
      const morpher = new Morphable(this._stepper).to(to2);
      this.queue(function() {
        morpher.from(this.element()[method]());
      }, function(pos) {
        this.element()[method](morpher.at(pos));
        return morpher.done();
      });
      this._rememberMorpher(method, morpher);
      return this;
    },
    _queueNumber(method, value) {
      return this._queueObject(method, new SVGNumber(value));
    },
    cx(x2) {
      return this._queueNumber("cx", x2);
    },
    cy(y2) {
      return this._queueNumber("cy", y2);
    },
    move(x2, y2) {
      return this.x(x2).y(y2);
    },
    amove(x2, y2) {
      return this.ax(x2).ay(y2);
    },
    center(x2, y2) {
      return this.cx(x2).cy(y2);
    },
    size(width2, height2) {
      const size2 = proportionalSize(this._element, width2, height2);
      return this.width(size2.width).height(size2.height);
    },
    width(width2) {
      return this._queueNumber("width", width2);
    },
    height(height2) {
      return this._queueNumber("height", height2);
    },
    plot(a, b, c, d) {
      if (arguments.length === 4) return this.plot([
        a,
        b,
        c,
        d
      ]);
      if (this._tryRetarget("plot", a)) return this;
      const morpher = new Morphable(this._stepper).type(this._element.MorphArray).to(a);
      this.queue(function() {
        morpher.from(this._element.array());
      }, function(pos) {
        this._element.plot(morpher.at(pos));
        return morpher.done();
      });
      this._rememberMorpher("plot", morpher);
      return this;
    },
    leading(value) {
      return this._queueNumber("leading", value);
    },
    viewbox(x2, y2, width2, height2) {
      return this._queueObject("viewbox", new Box(x2, y2, width2, height2));
    },
    update(o) {
      if (typeof o !== "object") return this.update({
        offset: arguments[0],
        color: arguments[1],
        opacity: arguments[2]
      });
      if (o.opacity != null) this.attr("stop-opacity", o.opacity);
      if (o.color != null) this.attr("stop-color", o.color);
      if (o.offset != null) this.attr("offset", o.offset);
      return this;
    }
  });
  extend(Runner, {
    rx,
    ry,
    from,
    to
  });
  register(Runner, "Runner");
  var Svg = class extends Container {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("svg", node), attrs2);
      this.namespace();
    }
    defs() {
      if (!this.isRoot()) return this.root().defs();
      return adopt(this.node.querySelector("defs")) || this.put(new Defs());
    }
    isRoot() {
      return !this.node.parentNode || !(this.node.parentNode instanceof globals.window.SVGElement) && this.node.parentNode.nodeName !== "#document-fragment";
    }
    namespace() {
      if (!this.isRoot()) return this.root().namespace();
      return this.attr({
        xmlns: svg,
        version: "1.1"
      }).attr("xmlns:xlink", xlink, xmlns);
    }
    removeNamespace() {
      return this.attr({
        xmlns: null,
        version: null
      }).attr("xmlns:xlink", null, xmlns).attr("xmlns:svgjs", null, xmlns);
    }
    root() {
      if (this.isRoot()) return this;
      return super.root();
    }
  };
  registerMethods({ Container: { nested: wrapWithAttrCheck(function() {
    return this.put(new Svg());
  }) } });
  register(Svg, "Svg", true);
  var Symbol$1 = class extends Container {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("symbol", node), attrs2);
    }
  };
  registerMethods({ Container: { symbol: wrapWithAttrCheck(function() {
    return this.put(new Symbol$1());
  }) } });
  register(Symbol$1, "Symbol");
  var textable_exports = /* @__PURE__ */ __exportAll({
    amove: () => amove,
    ax: () => ax,
    ay: () => ay,
    build: () => build,
    center: () => center,
    cx: () => cx,
    cy: () => cy,
    length: () => length,
    move: () => move$1,
    plain: () => plain,
    x: () => x$1,
    y: () => y$1
  });
  function plain(text) {
    if (this._build === false) this.clear();
    this.node.appendChild(globals.document.createTextNode(text));
    return this;
  }
  function length() {
    return this.node.getComputedTextLength();
  }
  function x$1(x2, box = this.bbox()) {
    if (x2 == null) return box.x;
    return this.attr("x", this.attr("x") + x2 - box.x);
  }
  function y$1(y2, box = this.bbox()) {
    if (y2 == null) return box.y;
    return this.attr("y", this.attr("y") + y2 - box.y);
  }
  function move$1(x2, y2, box = this.bbox()) {
    return this.x(x2, box).y(y2, box);
  }
  function cx(x2, box = this.bbox()) {
    if (x2 == null) return box.cx;
    return this.attr("x", this.attr("x") + x2 - box.cx);
  }
  function cy(y2, box = this.bbox()) {
    if (y2 == null) return box.cy;
    return this.attr("y", this.attr("y") + y2 - box.cy);
  }
  function center(x2, y2, box = this.bbox()) {
    return this.cx(x2, box).cy(y2, box);
  }
  function ax(x2) {
    return this.attr("x", x2);
  }
  function ay(y2) {
    return this.attr("y", y2);
  }
  function amove(x2, y2) {
    return this.ax(x2).ay(y2);
  }
  function build(build2) {
    this._build = !!build2;
    return this;
  }
  var Text = class extends Shape {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("text", node), attrs2);
      this.dom.leading = this.dom.leading ?? new SVGNumber(1.3);
      this._rebuild = true;
      this._build = false;
    }
    leading(value) {
      if (value == null) return this.dom.leading;
      this.dom.leading = new SVGNumber(value);
      return this.rebuild();
    }
    rebuild(rebuild) {
      if (typeof rebuild === "boolean") this._rebuild = rebuild;
      if (this._rebuild) {
        const self2 = this;
        let blankLineOffset = 0;
        const leading = this.dom.leading;
        this.each(function(i) {
          if (isDescriptive(this.node)) return;
          const fontSize = globals.window.getComputedStyle(this.node).getPropertyValue("font-size");
          const dy2 = leading * new SVGNumber(fontSize);
          if (this.dom.newLined) {
            this.attr("x", self2.attr("x"));
            if (this.text() === "\n") blankLineOffset += dy2;
            else {
              this.attr("dy", i ? dy2 + blankLineOffset : 0);
              blankLineOffset = 0;
            }
          }
        });
        this.fire("rebuild");
      }
      return this;
    }
    setData(o) {
      this.dom = o;
      this.dom.leading = new SVGNumber(o.leading || 1.3);
      return this;
    }
    writeDataToDom() {
      return super.writeDataToDom({ leading: 1.3 });
    }
    text(text) {
      if (text === void 0) {
        const children = this.node.childNodes;
        let firstLine = 0;
        text = "";
        for (let i = 0, len = children.length; i < len; ++i) {
          if (children[i].nodeName === "textPath" || isDescriptive(children[i])) {
            if (i === 0) firstLine = i + 1;
            continue;
          }
          if (i !== firstLine && children[i].nodeType !== 3 && adopt(children[i]).dom.newLined === true) text += "\n";
          text += children[i].textContent;
        }
        return text;
      }
      this.clear().build(true);
      if (typeof text === "function") text.call(this, this);
      else {
        text = (text + "").split("\n");
        for (let j = 0, jl = text.length; j < jl; j++) this.newLine(text[j]);
      }
      return this.build(false).rebuild();
    }
  };
  extend(Text, textable_exports);
  registerMethods({ Container: {
    text: wrapWithAttrCheck(function(text = "") {
      return this.put(new Text()).text(text);
    }),
    plain: wrapWithAttrCheck(function(text = "") {
      return this.put(new Text()).plain(text);
    })
  } });
  register(Text, "Text");
  var Tspan = class extends Shape {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("tspan", node), attrs2);
      this._build = false;
    }
    dx(dx2) {
      return this.attr("dx", dx2);
    }
    dy(dy2) {
      return this.attr("dy", dy2);
    }
    newLine() {
      this.dom.newLined = true;
      const text = this.parent();
      if (!(text instanceof Text)) return this;
      const i = text.index(this);
      const fontSize = globals.window.getComputedStyle(this.node).getPropertyValue("font-size");
      const dy2 = text.dom.leading * new SVGNumber(fontSize);
      return this.dy(i ? dy2 : 0).attr("x", text.x());
    }
    text(text) {
      if (text == null) return this.node.textContent + (this.dom.newLined ? "\n" : "");
      if (typeof text === "function") {
        this.clear().build(true);
        text.call(this, this);
        this.build(false);
      } else this.plain(text);
      return this;
    }
  };
  extend(Tspan, textable_exports);
  registerMethods({
    Tspan: { tspan: wrapWithAttrCheck(function(text = "") {
      const tspan = new Tspan();
      if (!this._build) this.clear();
      return this.put(tspan).text(text);
    }) },
    Text: { newLine: function(text = "") {
      return this.tspan(text).newLine();
    } }
  });
  register(Tspan, "Tspan");
  var Circle = class extends Shape {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("circle", node), attrs2);
    }
    radius(r) {
      return this.attr("r", r);
    }
    rx(rx2) {
      return this.attr("r", rx2);
    }
    ry(ry2) {
      return this.rx(ry2);
    }
    size(size2) {
      return this.radius(new SVGNumber(size2).divide(2));
    }
  };
  extend(Circle, {
    x: x$3,
    y: y$3,
    cx: cx$1,
    cy: cy$1,
    width: width$2,
    height: height$2
  });
  registerMethods({ Container: { circle: wrapWithAttrCheck(function(size2 = 0) {
    return this.put(new Circle()).size(size2).move(0, 0);
  }) } });
  register(Circle, "Circle");
  var ClipPath = class extends Container {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("clipPath", node), attrs2);
    }
    remove() {
      this.targets().forEach(function(el2) {
        el2.unclip();
      });
      return super.remove();
    }
    targets() {
      return findReferences(this.node, "clip-path");
    }
  };
  registerMethods({
    Container: { clip: wrapWithAttrCheck(function() {
      return this.defs().put(new ClipPath());
    }) },
    Element: {
      clipper() {
        return this.reference("clip-path");
      },
      clipWith(element) {
        const clipper = element instanceof ClipPath ? element : this.parent().clip().add(element);
        return this.attr("clip-path", "url(#" + clipper.id() + ")");
      },
      unclip() {
        return this.attr("clip-path", null);
      }
    }
  });
  register(ClipPath, "ClipPath");
  var ForeignObject = class extends Element {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("foreignObject", node), attrs2);
    }
  };
  registerMethods({ Container: { foreignObject: wrapWithAttrCheck(function(width2, height2) {
    return this.put(new ForeignObject()).size(width2, height2);
  }) } });
  register(ForeignObject, "ForeignObject");
  var containerGeometry_exports = /* @__PURE__ */ __exportAll({
    dmove: () => dmove,
    dx: () => dx,
    dy: () => dy,
    height: () => height,
    move: () => move,
    size: () => size,
    width: () => width,
    x: () => x,
    y: () => y
  });
  function dmove(dx2, dy2) {
    this.children().forEach((child) => {
      let bbox2;
      try {
        bbox2 = child.node instanceof getWindow().SVGSVGElement ? new Box(child.attr([
          "x",
          "y",
          "width",
          "height"
        ])) : child.bbox();
      } catch (e) {
        return;
      }
      const m = new Matrix(child);
      const matrix = m.translate(dx2, dy2).transform(m.inverse());
      const p = new Point(bbox2.x, bbox2.y).transform(matrix);
      child.dmove(p.x - bbox2.x, p.y - bbox2.y);
    });
    return this;
  }
  function dx(dx2) {
    return this.dmove(dx2, 0);
  }
  function dy(dy2) {
    return this.dmove(0, dy2);
  }
  function height(height2, box = this.bbox()) {
    if (height2 == null) return box.height;
    return this.size(box.width, height2, box);
  }
  function move(x2 = 0, y2 = 0, box = this.bbox()) {
    const dx2 = x2 - box.x;
    const dy2 = y2 - box.y;
    return this.dmove(dx2, dy2);
  }
  function size(width2, height2, box = this.bbox()) {
    const p = proportionalSize(this, width2, height2, box);
    const scaleX = p.width / box.width;
    const scaleY = p.height / box.height;
    this.children().forEach((child) => {
      const o = new Point(box).transform(new Matrix(child).inverse());
      child.scale(scaleX, scaleY, o.x, o.y);
    });
    return this;
  }
  function width(width2, box = this.bbox()) {
    if (width2 == null) return box.width;
    return this.size(width2, box.height, box);
  }
  function x(x2, box = this.bbox()) {
    if (x2 == null) return box.x;
    return this.move(x2, box.y, box);
  }
  function y(y2, box = this.bbox()) {
    if (y2 == null) return box.y;
    return this.move(box.x, y2, box);
  }
  var G = class extends Container {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("g", node), attrs2);
    }
  };
  extend(G, containerGeometry_exports);
  registerMethods({ Container: { group: wrapWithAttrCheck(function() {
    return this.put(new G());
  }) } });
  register(G, "G");
  var A = class extends Container {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("a", node), attrs2);
    }
    target(target) {
      return this.attr("target", target);
    }
    to(url) {
      return this.attr("href", url, xlink);
    }
  };
  extend(A, containerGeometry_exports);
  registerMethods({
    Container: { link: wrapWithAttrCheck(function(url) {
      return this.put(new A()).to(url);
    }) },
    Element: {
      unlink() {
        const link = this.linker();
        if (!link) return this;
        const parent = link.parent();
        if (!parent) return this.remove();
        const index = parent.index(link);
        parent.add(this, index);
        link.remove();
        return this;
      },
      linkTo(url) {
        let link = this.linker();
        if (!link) {
          link = new A();
          this.wrap(link);
        }
        if (typeof url === "function") url.call(link, link);
        else link.to(url);
        return this;
      },
      linker() {
        const link = this.parent();
        if (link && link.node.nodeName.toLowerCase() === "a") return link;
        return null;
      }
    }
  });
  register(A, "A");
  var Mask = class extends Container {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("mask", node), attrs2);
    }
    remove() {
      this.targets().forEach(function(el2) {
        el2.unmask();
      });
      return super.remove();
    }
    targets() {
      return findReferences(this.node, "mask");
    }
  };
  registerMethods({
    Container: { mask: wrapWithAttrCheck(function() {
      return this.defs().put(new Mask());
    }) },
    Element: {
      masker() {
        return this.reference("mask");
      },
      maskWith(element) {
        const masker = element instanceof Mask ? element : this.parent().mask().add(element);
        return this.attr("mask", "url(#" + masker.id() + ")");
      },
      unmask() {
        return this.attr("mask", null);
      }
    }
  });
  register(Mask, "Mask");
  var Stop = class extends Element {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("stop", node), attrs2);
    }
    update(o) {
      if (typeof o === "number" || o instanceof SVGNumber) o = {
        offset: arguments[0],
        color: arguments[1],
        opacity: arguments[2]
      };
      if (o.opacity != null) this.attr("stop-opacity", o.opacity);
      if (o.color != null) this.attr("stop-color", o.color);
      if (o.offset != null) this.attr("offset", new SVGNumber(o.offset));
      return this;
    }
  };
  registerMethods({ Gradient: { stop: function(offset, color, opacity) {
    return this.put(new Stop()).update(offset, color, opacity);
  } } });
  register(Stop, "Stop");
  function cssRule(selector, rule) {
    if (!selector) return "";
    if (!rule) return selector;
    let ret = selector + "{";
    for (const i in rule) ret += unCamelCase(i) + ":" + rule[i] + ";";
    ret += "}";
    return ret;
  }
  var Style = class extends Element {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("style", node), attrs2);
    }
    addText(w = "") {
      this.node.textContent += w;
      return this;
    }
    font(name, src, params = {}) {
      return this.rule("@font-face", {
        fontFamily: name,
        src,
        ...params
      });
    }
    rule(selector, obj) {
      return this.addText(cssRule(selector, obj));
    }
  };
  registerMethods("Dom", {
    style(selector, obj) {
      return this.put(new Style()).rule(selector, obj);
    },
    fontface(name, src, params) {
      return this.put(new Style()).font(name, src, params);
    }
  });
  register(Style, "Style");
  var TextPath = class extends Text {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("textPath", node), attrs2);
    }
    array() {
      const track = this.track();
      return track ? track.array() : null;
    }
    plot(d) {
      const track = this.track();
      let pathArray = null;
      if (track) pathArray = track.plot(d);
      return d == null ? pathArray : this;
    }
    track() {
      return this.reference("href");
    }
  };
  registerMethods({
    Container: { textPath: wrapWithAttrCheck(function(text, path) {
      if (!(text instanceof Text)) text = this.text(text);
      return text.path(path);
    }) },
    Text: {
      path: wrapWithAttrCheck(function(track, importNodes = true) {
        const textPath = new TextPath();
        if (!(track instanceof Path)) track = this.defs().path(track);
        textPath.attr("href", "#" + track, xlink);
        let node;
        if (importNodes) while (node = this.node.firstChild) textPath.node.appendChild(node);
        return this.put(textPath);
      }),
      textPath() {
        return this.findOne("textPath");
      }
    },
    Path: {
      text: wrapWithAttrCheck(function(text) {
        if (!(text instanceof Text)) text = new Text().addTo(this.parent()).text(text);
        return text.path(this);
      }),
      targets() {
        return findReferences(this.node, "href", "textPath");
      }
    }
  });
  TextPath.prototype.MorphArray = PathArray;
  register(TextPath, "TextPath");
  var Use = class extends Shape {
    constructor(node, attrs2 = node) {
      super(nodeOrNew("use", node), attrs2);
    }
    use(element, file) {
      return this.attr("href", (file || "") + "#" + element, xlink);
    }
  };
  registerMethods({ Container: { use: wrapWithAttrCheck(function(element, file) {
    return this.put(new Use()).use(element, file);
  }) } });
  register(Use, "Use");
  var SVG = makeInstance;
  extend([
    Svg,
    Symbol$1,
    Image,
    Pattern,
    Marker
  ], getMethodsFor("viewbox"));
  extend([
    Line,
    Polyline,
    Polygon,
    Path
  ], getMethodsFor("marker"));
  extend(Text, getMethodsFor("Text"));
  extend(Path, getMethodsFor("Path"));
  extend(Defs, getMethodsFor("Defs"));
  extend([Text, Tspan], getMethodsFor("Tspan"));
  extend([
    Rect,
    Ellipse,
    Gradient,
    Runner
  ], getMethodsFor("radius"));
  extend(EventTarget, getMethodsFor("EventTarget"));
  extend(Dom, getMethodsFor("Dom"));
  extend(Element, getMethodsFor("Element"));
  extend(Shape, getMethodsFor("Shape"));
  extend([Container, Fragment], getMethodsFor("Container"));
  extend(Gradient, getMethodsFor("Gradient"));
  extend(Runner, getMethodsFor("Runner"));
  List.extend(getMethodNames());
  registerMorphableType([
    SVGNumber,
    Color,
    Box,
    Matrix,
    SVGArray,
    PointArray,
    PathArray,
    Point
  ]);
  makeMorphable();

  // ../../node_modules/@svgdotjs/svg.panzoom.js/dist/svg.panzoom.esm.js
  /*!
  * @svgdotjs/svg.panzoom.js - A plugin for svg.js that enables panzoom for viewport elements
  * @version 2.1.2
  * https://github.com/svgdotjs/svg.panzoom.js#readme
  *
  * @copyright undefined
  * @license MIT
  *
  * BUILT: Thu Jul 22 2021 14:51:35 GMT+0200 (Mitteleuropäische Sommerzeit)
  */
  var normalizeEvent = function normalizeEvent2(ev) {
    return ev.touches || [{
      clientX: ev.clientX,
      clientY: ev.clientY
    }];
  };
  extend(Svg, {
    panZoom: function panZoom(options) {
      var _options, _options$zoomFactor, _options$zoomMin, _options$zoomMax, _options$wheelZoom, _options$pinchZoom, _options$panning, _options$panButton, _options$oneFingerPan, _options$margins, _options$wheelZoomDel, _options$wheelZoomDel2, _this = this;
      this.off(".panZoom");
      if (options === false) return this;
      options = (_options = options) != null ? _options : {};
      var zoomFactor = (_options$zoomFactor = options.zoomFactor) != null ? _options$zoomFactor : 2;
      var zoomMin = (_options$zoomMin = options.zoomMin) != null ? _options$zoomMin : Number.MIN_VALUE;
      var zoomMax = (_options$zoomMax = options.zoomMax) != null ? _options$zoomMax : Number.MAX_VALUE;
      var doWheelZoom = (_options$wheelZoom = options.wheelZoom) != null ? _options$wheelZoom : true;
      var doPinchZoom = (_options$pinchZoom = options.pinchZoom) != null ? _options$pinchZoom : true;
      var doPanning = (_options$panning = options.panning) != null ? _options$panning : true;
      var panButton = (_options$panButton = options.panButton) != null ? _options$panButton : 0;
      var oneFingerPan = (_options$oneFingerPan = options.oneFingerPan) != null ? _options$oneFingerPan : false;
      var margins = (_options$margins = options.margins) != null ? _options$margins : false;
      var wheelZoomDeltaModeLinePixels = (_options$wheelZoomDel = options.wheelZoomDeltaModeLinePixels) != null ? _options$wheelZoomDel : 17;
      var wheelZoomDeltaModeScreenPixels = (_options$wheelZoomDel2 = options.wheelZoomDeltaModeScreenPixels) != null ? _options$wheelZoomDel2 : 53;
      var lastP;
      var lastTouches;
      var zoomInProgress = false;
      var viewbox = this.viewbox();
      var restrictToMargins = function restrictToMargins2(box) {
        if (!margins) return box;
        var top = margins.top, left = margins.left, bottom = margins.bottom, right = margins.right;
        var _this$attr = _this.attr(["width", "height"]), width2 = _this$attr.width, height2 = _this$attr.height;
        var preserveAspectRatio = _this.node.preserveAspectRatio.baseVal;
        var viewportLeftOffset = 0;
        var viewportRightOffset = 0;
        var viewportTopOffset = 0;
        var viewportBottomOffset = 0;
        if (preserveAspectRatio.align !== preserveAspectRatio.SVG_PRESERVEASPECTRATIO_NONE) {
          var svgAspectRatio = width2 / height2;
          var viewboxAspectRatio = viewbox.width / viewbox.height;
          if (viewboxAspectRatio !== svgAspectRatio) {
            var isMeet = preserveAspectRatio.meetOrSlice !== preserveAspectRatio.SVG_MEETORSLICE_SLICE;
            var changedAxis = svgAspectRatio > viewboxAspectRatio ? "width" : "height";
            var isWidth = changedAxis === "width";
            var changeHorizontal = isMeet && isWidth || !isMeet && !isWidth;
            var ratio = changeHorizontal ? svgAspectRatio / viewboxAspectRatio : viewboxAspectRatio / svgAspectRatio;
            var offset = box[changedAxis] - box[changedAxis] * ratio;
            if (changeHorizontal) {
              if (preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMIDYMIN || preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMIDYMID || preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMIDYMAX) {
                viewportLeftOffset = offset / 2;
                viewportRightOffset = -offset / 2;
              } else if (preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMIN || preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMID || preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMAX) {
                viewportRightOffset = -offset;
              } else if (preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMAXYMIN || preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMAXYMID || preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMAXYMAX) {
                viewportLeftOffset = offset;
              }
            } else {
              if (preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMID || preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMIDYMID || preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMAXYMID) {
                viewportTopOffset = offset / 2;
                viewportBottomOffset = -offset / 2;
              } else if (preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMIN || preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMIDYMIN || preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMAXYMIN) {
                viewportBottomOffset = -offset;
              } else if (preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMAX || preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMIDYMAX || preserveAspectRatio.align === preserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMAXYMAX) {
                viewportTopOffset = offset;
              }
            }
          }
        }
        var leftLimit = viewbox.width + viewbox.x - left - viewportLeftOffset;
        var rightLimit = viewbox.x + right - box.width - viewportRightOffset;
        var topLimit = viewbox.height + viewbox.y - top - viewportTopOffset;
        var bottomLimit = viewbox.y + bottom - box.height - viewportBottomOffset;
        box.x = Math.min(leftLimit, Math.max(rightLimit, box.x));
        box.y = Math.min(topLimit, Math.max(bottomLimit, box.y));
        return box;
      };
      var wheelZoom = function wheelZoom2(ev) {
        ev.preventDefault();
        var normalizedPixelDeltaY;
        switch (ev.deltaMode) {
          case 1:
            normalizedPixelDeltaY = ev.deltaY * wheelZoomDeltaModeLinePixels;
            break;
          case 2:
            normalizedPixelDeltaY = ev.deltaY * wheelZoomDeltaModeScreenPixels;
            break;
          default:
            normalizedPixelDeltaY = ev.deltaY;
            break;
        }
        var lvl = Math.pow(1 + zoomFactor, -1 * normalizedPixelDeltaY / 100) * this.zoom();
        var p = this.point(ev.clientX, ev.clientY);
        if (lvl > zoomMax) {
          lvl = zoomMax;
        }
        if (lvl < zoomMin) {
          lvl = zoomMin;
        }
        if (this.dispatch("zoom", {
          level: lvl,
          focus: p
        }).defaultPrevented) {
          return this;
        }
        this.zoom(lvl, p);
        if (margins) {
          var box = restrictToMargins(this.viewbox());
          this.viewbox(box);
        }
      };
      var pinchZoomStart = function pinchZoomStart2(ev) {
        lastTouches = normalizeEvent(ev);
        if (lastTouches.length < 2) {
          if (doPanning && oneFingerPan) {
            panStart.call(this, ev);
          }
          return;
        }
        if (doPanning && oneFingerPan) {
          panStop.call(this, ev);
        }
        ev.preventDefault();
        if (this.dispatch("pinchZoomStart", {
          event: ev
        }).defaultPrevented) {
          return;
        }
        this.off("touchstart.panZoom", pinchZoomStart2);
        zoomInProgress = true;
        on(document, "touchmove.panZoom", pinchZoom, this, {
          passive: false
        });
        on(document, "touchend.panZoom", pinchZoomStop, this, {
          passive: false
        });
      };
      var pinchZoomStop = function pinchZoomStop2(ev) {
        ev.preventDefault();
        var currentTouches = normalizeEvent(ev);
        if (currentTouches.length > 1) {
          return;
        }
        zoomInProgress = false;
        this.dispatch("pinchZoomEnd", {
          event: ev
        });
        off(document, "touchmove.panZoom", pinchZoom);
        off(document, "touchend.panZoom", pinchZoomStop2);
        this.on("touchstart.panZoom", pinchZoomStart);
        if (currentTouches.length && doPanning && oneFingerPan) {
          panStart.call(this, ev);
        }
      };
      var pinchZoom = function pinchZoom2(ev) {
        ev.preventDefault();
        var currentTouches = normalizeEvent(ev);
        var zoom = this.zoom();
        var lastDelta = Math.sqrt(Math.pow(lastTouches[0].clientX - lastTouches[1].clientX, 2) + Math.pow(lastTouches[0].clientY - lastTouches[1].clientY, 2));
        var currentDelta = Math.sqrt(Math.pow(currentTouches[0].clientX - currentTouches[1].clientX, 2) + Math.pow(currentTouches[0].clientY - currentTouches[1].clientY, 2));
        var zoomAmount = lastDelta / currentDelta;
        if (zoom < zoomMin && zoomAmount > 1 || zoom > zoomMax && zoomAmount < 1) {
          zoomAmount = 1;
        }
        var currentFocus = {
          x: currentTouches[0].clientX + 0.5 * (currentTouches[1].clientX - currentTouches[0].clientX),
          y: currentTouches[0].clientY + 0.5 * (currentTouches[1].clientY - currentTouches[0].clientY)
        };
        var lastFocus = {
          x: lastTouches[0].clientX + 0.5 * (lastTouches[1].clientX - lastTouches[0].clientX),
          y: lastTouches[0].clientY + 0.5 * (lastTouches[1].clientY - lastTouches[0].clientY)
        };
        var p = this.point(currentFocus.x, currentFocus.y);
        var focusP = this.point(2 * currentFocus.x - lastFocus.x, 2 * currentFocus.y - lastFocus.y);
        var box = new Box(this.viewbox()).transform(new Matrix().translate(-focusP.x, -focusP.y).scale(zoomAmount, 0, 0).translate(p.x, p.y));
        restrictToMargins(box);
        this.viewbox(box);
        lastTouches = currentTouches;
        this.dispatch("zoom", {
          box,
          focus: focusP
        });
      };
      var panStart = function panStart2(ev) {
        var isMouse = ev.type.indexOf("mouse") > -1;
        if (isMouse && ev.button !== panButton && ev.which !== panButton + 1) {
          return;
        }
        ev.preventDefault();
        this.off("mousedown.panZoom", panStart2);
        lastTouches = normalizeEvent(ev);
        if (zoomInProgress) return;
        this.dispatch("panStart", {
          event: ev
        });
        lastP = {
          x: lastTouches[0].clientX,
          y: lastTouches[0].clientY
        };
        on(document, "touchmove.panZoom mousemove.panZoom", panning, this, {
          passive: false
        });
        on(document, "touchend.panZoom mouseup.panZoom", panStop, this, {
          passive: false
        });
      };
      var panStop = function panStop2(ev) {
        ev.preventDefault();
        off(document, "touchmove.panZoom mousemove.panZoom", panning);
        off(document, "touchend.panZoom mouseup.panZoom", panStop2);
        this.on("mousedown.panZoom", panStart);
        this.dispatch("panEnd", {
          event: ev
        });
      };
      var panning = function panning2(ev) {
        ev.preventDefault();
        var currentTouches = normalizeEvent(ev);
        var currentP = {
          x: currentTouches[0].clientX,
          y: currentTouches[0].clientY
        };
        var p1 = this.point(currentP.x, currentP.y);
        var p2 = this.point(lastP.x, lastP.y);
        var deltaP = [p2.x - p1.x, p2.y - p1.y];
        if (!deltaP[0] && !deltaP[1]) {
          return;
        }
        var box = new Box(this.viewbox()).transform(new Matrix().translate(deltaP[0], deltaP[1]));
        lastP = currentP;
        restrictToMargins(box);
        if (this.dispatch("panning", {
          box,
          event: ev
        }).defaultPrevented) {
          return;
        }
        this.viewbox(box);
      };
      if (doWheelZoom) {
        this.on("wheel.panZoom", wheelZoom, this, {
          passive: false
        });
      }
      if (doPinchZoom) {
        this.on("touchstart.panZoom", pinchZoomStart, this, {
          passive: false
        });
      }
      if (doPanning) {
        this.on("mousedown.panZoom", panStart, this, {
          passive: false
        });
      }
      return this;
    }
  });

  // src/renderer/sankey-renderer.ts
  function assertSameIdSet(currentIds, incomingIds, kind) {
    for (const id of incomingIds) {
      if (!currentIds.has(id)) {
        throw new Error(
          `updateScenarioFlows: topology mismatch \u2014 ${kind} '${id}' not in current scenario. Use updateTopology()`
        );
      }
    }
    for (const id of currentIds) {
      if (!incomingIds.has(id)) {
        throw new Error(
          `updateScenarioFlows: topology mismatch \u2014 ${kind} '${id}' missing from incoming scenario. Use updateTopology()`
        );
      }
    }
  }
  function filterNaNBuses(scenario) {
    const safeBuses = scenario.buses.filter((b) => Number.isFinite(b.voltage_angle));
    if (safeBuses.length < scenario.buses.length) {
      const nanIds = scenario.buses.filter((b) => !Number.isFinite(b.voltage_angle)).map((b) => b.id);
      console.warn(`SankeyRenderer: excluded buses with non-finite voltage_angle: ${nanIds.join(", ")}`);
    }
    const safeIds = new Set(safeBuses.map((b) => b.id));
    const safeBranches = scenario.branches.filter((br) => safeIds.has(br.from_bus) && safeIds.has(br.to_bus));
    return { ...scenario, buses: safeBuses, branches: safeBranches };
  }
  var SankeyRenderer = class _SankeyRenderer {
    svg;
    svgDraw;
    scenario;
    svgElements;
    sfpd;
    maxpmax;
    layoutIndex;
    scFlat;
    scFlatPrev;
    scFlatPrev2;
    scFlatDisplay;
    stFlat;
    _layoutStartTime = 0;
    static MAX_LAYOUT_MS = 2e3;
    stackCoord;
    stackCoordOffset;
    ts;
    stretch = 1;
    rawAlign = 5;
    rawRepulse = 5;
    tanStrength = Math.pow(10, this.rawAlign - 5);
    dRepulse = Math.pow(10, this.rawRepulse - 5);
    isHorizontal = false;
    rafLoop;
    constructor(container, scenario, options) {
      this.svgDraw = SVG().addTo(container);
      this.svg = this.svgDraw.node;
      if (options?.width && options?.height) {
        this.svg.style.width = `${options.width}px`;
        this.svg.style.height = `${options.height}px`;
      } else {
        this.svg.removeAttribute("width");
        this.svg.removeAttribute("height");
        this.svg.style.width = "100%";
        this.svg.style.height = "100%";
      }
      this._init(scenario);
      let fitZoom;
      try {
        fitZoom = this.svgDraw.zoom();
      } catch {
        fitZoom = Number.NaN;
      }
      this.svgDraw.panZoom({
        panning: true,
        zoomFactor: 0.2,
        zoomMin: Number.isFinite(fitZoom) && fitZoom > 0 ? fitZoom * 0.1 : 1e-3,
        zoomMax: Number.isFinite(fitZoom) && fitZoom > 0 ? fitZoom * 200 : 5e3
      });
      this.rafLoop = new RafLoop((dt) => this._tick(dt));
    }
    _init(scenario) {
      scenario = filterNaNBuses(scenario);
      this.scenario = { ...scenario, branches: scenario.branches.map((br) => ({ ...br })) };
      const busIds = scenario.buses.map((b) => b.id);
      const flows = new Map(scenario.branches.map((br) => [branchKey(br), br.flow]));
      const states = new Map(scenario.buses.map((b) => [b.id, b.voltage_angle]));
      this.sfpd = parseSfpd(busIds, scenario.branches, flows);
      this.maxpmax = createMaxpmax(this.sfpd, flows);
      this.layoutIndex = buildLayoutIndex(busIds, this.sfpd, this.maxpmax);
      const N = this.layoutIndex.N;
      this.scFlat = new Float64Array(N);
      this.scFlatPrev = new Float64Array(N);
      this.scFlatPrev2 = new Float64Array(N);
      this.scFlatDisplay = new Float64Array(N);
      this.stFlat = new Float64Array(N);
      const { stackCoord, stackCoordOffset } = initStackCoord(busIds, scenario.branches);
      const mpmMax = Math.max(...this.maxpmax.values(), 1);
      randomReset(stackCoord, 2 * mpmMax * Math.sqrt(scenario.buses.length));
      this.stackCoord = stackCoord;
      this.stackCoordOffset = stackCoordOffset;
      flatFromMap(this.layoutIndex, stackCoord, this.scFlat);
      this.scFlatDisplay.set(this.scFlat);
      flatFromMap(this.layoutIndex, states, this.stFlat);
      rearrangeStackCoordOffset(this.stackCoordOffset, states, flows, this.stackCoord, this.sfpd, this.maxpmax);
      this.ts = createFlowTransitionState(states, flows);
      this.svgElements = createSvgStructure(this.svg, scenario);
      this._setInitialViewBox();
    }
    _setInitialViewBox() {
      const { states, isHorizontal } = this._buildRenderState();
      const mpmMax = Math.max(...this.maxpmax.values(), 1);
      const stackExt = mpmMax * Math.sqrt(this.scenario.buses.length);
      const stateVals = [...states.values()];
      const sMin = Math.min(...stateVals);
      const sMax = Math.max(...stateVals);
      const sPad = Math.max(1e-6, sMax - sMin) * 0.05;
      const stPad = stackExt * 0.1;
      this.svg.setAttribute("preserveAspectRatio", "none");
      if (isHorizontal) {
        this.svg.setAttribute(
          "viewBox",
          `${-sMax - sPad} ${-stackExt - stPad} ${sMax - sMin + 2 * sPad} ${2 * stackExt + 2 * stPad}`
        );
      } else {
        this.svg.setAttribute(
          "viewBox",
          `${-stackExt - stPad} ${-sMax - sPad} ${2 * stackExt + 2 * stPad} ${sMax - sMin + 2 * sPad}`
        );
      }
    }
    _allocAndWarmStart(oldBusIdSet, newBusIds, inheritedPos, mpmMax, N) {
      flatToMap(this.layoutIndex, this.scFlat, this.stackCoord);
      const scFlat = new Float64Array(N);
      const jitterScale = 1e-6 * mpmMax;
      for (let i = 0; i < N; i++) {
        const id = newBusIds[i];
        if (oldBusIdSet.has(id)) {
          scFlat[i] = this.stackCoord.get(id) ?? 0;
        } else {
          const pred = inheritedPos[id];
          scFlat[i] = pred !== void 0 ? this.stackCoord.get(pred) ?? 0 : 0;
          scFlat[i] += (Math.random() - 0.5) * 2 * jitterScale;
        }
      }
      return scFlat;
    }
    _buildRenderState() {
      return {
        states: this.ts.currentStates,
        flows: this.ts.currentFlows,
        stackCoord: this.stackCoord,
        stackCoordOffset: this.stackCoordOffset,
        stretch: this.stretch,
        isHorizontal: this.isHorizontal
      };
    }
    _tick(dt) {
      transitFlowsState(this.ts);
      flatFromMap(this.layoutIndex, this.ts.currentStates, this.stFlat);
      this.scFlatPrev2.set(this.scFlatPrev);
      this.scFlatPrev.set(this.scFlat);
      rearrangeStackCoord(
        this.layoutIndex,
        this.scFlat,
        this.stFlat,
        this.ts.currentFlows,
        this.tanStrength,
        this.dRepulse
      );
      const emaTimeConstantMs = 120;
      const emaWeight = 1 - Math.exp(-dt / emaTimeConstantMs);
      for (let i = 0; i < this.layoutIndex.N; i++) {
        this.scFlatDisplay[i] += (this.scFlat[i] - this.scFlatDisplay[i]) * emaWeight;
      }
      const mpmMax = Math.max(...this.maxpmax.values(), 1);
      const eps = mpmMax * 1e-4;
      let maxDelta = 0;
      for (let i = 0; i < this.layoutIndex.N; i++) {
        const d = Math.abs(this.scFlat[i] - this.scFlatPrev2[i]);
        if (d > maxDelta) maxDelta = d;
      }
      const elapsed = Date.now() - this._layoutStartTime;
      const converged = maxDelta < eps || elapsed >= _SankeyRenderer.MAX_LAYOUT_MS;
      if (converged && isTransitionDone(this.ts)) {
        for (let i = 0; i < this.layoutIndex.N; i++) {
          this.scFlat[i] = (this.scFlat[i] + this.scFlatPrev[i]) * 0.5;
        }
        this.scFlatDisplay.set(this.scFlat);
        this.rafLoop.stop();
      }
      flatToMap(this.layoutIndex, this.scFlatDisplay, this.stackCoord);
      rearrangeStackCoordOffset(
        this.stackCoordOffset,
        this.ts.currentStates,
        this.ts.currentFlows,
        this.stackCoord,
        this.sfpd,
        this.maxpmax
      );
      updateAttributes(this.svgElements, this.scenario, this._buildRenderState(), this.maxpmax);
    }
    update(scenario) {
      this.svgElements.diagramGroup.remove();
      this._init(scenario);
    }
    updateScenarioFlows(scenario) {
      const currentBusIds = new Set(this.scenario.buses.map((b) => b.id));
      const incomingBusIds = new Set(scenario.buses.map((b) => b.id));
      assertSameIdSet(currentBusIds, incomingBusIds, "bus");
      const currentBranchKeys = new Set(this.scenario.branches.map((br) => branchKey(br)));
      const incomingBranchKeys = new Set(scenario.branches.map((br) => branchKey(br)));
      assertSameIdSet(currentBranchKeys, incomingBranchKeys, "branch");
      const flows = new Map(scenario.branches.map((br) => [branchKey(br), br.flow]));
      const states = new Map(scenario.buses.map((b) => [b.id, b.voltage_angle]));
      const branchMeta = new Map(scenario.branches.map((br) => [branchKey(br), br]));
      for (let i = 0; i < this.scenario.branches.length; i++) {
        const key = this.svgElements.branchKeys[i];
        const newBr = branchMeta.get(key);
        if (newBr) {
          this.scenario.branches[i].outage = newBr.outage;
          this.scenario.branches[i].p_max = newBr.p_max;
          this.svgElements.pMaxValues[i] = newBr.p_max;
        } else {
          this.scenario.branches[i].outage = true;
        }
      }
      const busIds = this.scenario.buses.map((b) => b.id);
      this.sfpd = parseSfpd(busIds, this.scenario.branches, flows);
      this.maxpmax = createMaxpmax(this.sfpd, flows);
      for (let i = 0; i < this.layoutIndex.N; i++) {
        this.layoutIndex.mpmFlat[i] = this.maxpmax.get(this.layoutIndex.busArr[i]) ?? 0;
      }
      updateFlows(this.ts, states, flows);
      this.startLayout();
    }
    updateTopology(scenario) {
      scenario = filterNaNBuses(scenario);
      if (!isTransitionDone(this.ts)) {
        this.ts = createFlowTransitionState(this.ts.nextStates, this.ts.nextFlows);
      }
      const diff = diffTopology(this.scenario, scenario);
      this.svgElements = applyTopologyDiff(this.svgElements, this.scenario, scenario, diff);
      const oldBusIdSet = new Set(this.scenario.buses.map((b) => b.id));
      this.scenario = { ...scenario, branches: scenario.branches.map((br) => ({ ...br })) };
      const busIds = this.scenario.buses.map((b) => b.id);
      const flows = new Map(this.scenario.branches.map((br) => [branchKey(br), br.flow]));
      const states = new Map(this.scenario.buses.map((b) => [b.id, b.voltage_angle]));
      this.sfpd = parseSfpd(busIds, this.scenario.branches, flows);
      this.maxpmax = createMaxpmax(this.sfpd, flows);
      const mpmMax = Math.max(...this.maxpmax.values(), 1);
      const inheritedPos = scenario.inherited_positions ?? {};
      this.scFlat = this._allocAndWarmStart(oldBusIdSet, busIds, inheritedPos, mpmMax, busIds.length);
      this.layoutIndex = buildLayoutIndex(busIds, this.sfpd, this.maxpmax);
      this.scFlatPrev = new Float64Array(this.scFlat);
      this.scFlatPrev2 = new Float64Array(this.scFlat);
      this.scFlatDisplay = new Float64Array(this.scFlat);
      this.stFlat = new Float64Array(busIds.length);
      flatFromMap(this.layoutIndex, states, this.stFlat);
      flatToMap(this.layoutIndex, this.scFlat, this.stackCoord);
      const { stackCoordOffset } = initStackCoord(busIds, this.scenario.branches);
      this.stackCoordOffset = stackCoordOffset;
      rearrangeStackCoordOffset(this.stackCoordOffset, states, flows, this.stackCoord, this.sfpd, this.maxpmax);
      this.ts = createTopologyTransitionState(this.ts.currentStates, this.ts.currentFlows, states, flows);
      this.startLayout();
    }
    setOrientation(o) {
      this.isHorizontal = o === "horizontal";
      this._setInitialViewBox();
      updateAttributes(this.svgElements, this.scenario, this._buildRenderState(), this.maxpmax);
    }
    setStretch(v) {
      this.stretch = v;
      updateAttributes(this.svgElements, this.scenario, this._buildRenderState(), this.maxpmax);
    }
    setAlign(v) {
      this.rawAlign = v;
      this.tanStrength = Math.pow(10, v - 5);
      updateAttributes(this.svgElements, this.scenario, this._buildRenderState(), this.maxpmax);
    }
    setRepulse(v) {
      this.rawRepulse = v;
      this.dRepulse = Math.pow(10, v - 5);
      updateAttributes(this.svgElements, this.scenario, this._buildRenderState(), this.maxpmax);
    }
    startLayout() {
      this._layoutStartTime = Date.now();
      this.rafLoop.start();
    }
    stopLayout() {
      this.rafLoop.stop();
    }
    isRunning() {
      return this.rafLoop.isRunning();
    }
    exportLayout() {
      flatToMap(this.layoutIndex, this.scFlat, this.stackCoord);
      const layout = {};
      for (const busId of this.layoutIndex.busArr) layout[busId] = this.stackCoord.get(busId) ?? 0;
      return {
        version: 1,
        params: { stretch: this.stretch, align: this.rawAlign, repulse: this.rawRepulse },
        layout
      };
    }
    importLayout(data2) {
      this.rafLoop.stop();
      for (const [busId, v] of Object.entries(data2.layout)) this.stackCoord.set(busId, v);
      flatFromMap(this.layoutIndex, this.stackCoord, this.scFlat);
      this.scFlatPrev.set(this.scFlat);
      this.scFlatPrev2.set(this.scFlat);
      this.scFlatDisplay.set(this.scFlat);
      this.stretch = data2.params.stretch;
      this.rawAlign = data2.params.align;
      this.tanStrength = Math.pow(10, data2.params.align - 5);
      this.rawRepulse = data2.params.repulse;
      this.dRepulse = Math.pow(10, data2.params.repulse - 5);
      rearrangeStackCoordOffset(
        this.stackCoordOffset,
        this.ts.currentStates,
        this.ts.currentFlows,
        this.stackCoord,
        this.sfpd,
        this.maxpmax
      );
      updateAttributes(this.svgElements, this.scenario, this._buildRenderState(), this.maxpmax);
    }
    exportSVG() {
      return new XMLSerializer().serializeToString(this.svg);
    }
    autoscale() {
      const g = this.svgElements.diagramGroup;
      if (typeof g.getBBox === "function") {
        const bbox2 = g.getBBox();
        if (bbox2.width > 0 && bbox2.height > 0) {
          const padX = bbox2.width * 0.05;
          const padY = bbox2.height * 0.1;
          this.svgDraw?.viewbox(bbox2.x - padX, bbox2.y - padY, bbox2.width + 2 * padX, bbox2.height + 2 * padY);
          updateAttributes(this.svgElements, this.scenario, this._buildRenderState(), this.maxpmax);
          return;
        }
      }
      flatToMap(this.layoutIndex, this.scFlat, this.stackCoord);
      fitViewBox(this.svg, this.scenario, this._buildRenderState(), this.maxpmax);
      updateAttributes(this.svgElements, this.scenario, this._buildRenderState(), this.maxpmax);
    }
  };
  return __toCommonJS(index_exports);
})();
