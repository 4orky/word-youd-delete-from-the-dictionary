// The Word You'd Delete From the Dictionary — entry program.
//
// Writes exactly one word to /output/entry.txt: the single word we would
// erase from the dictionary forever, with nothing else attached.
//
// How the word was picked (hand-written, scored 0-5 on the judge brief):
//   speed     — the joke lands the moment the word is gone, no caption needed
//   intrinsic — the humour comes from the word itself: its sound, its double
//               meanings, or the gap its deletion leaves in the language
//   fresh     — the rest of the field would not think of it first, checked
//               against the ~400 entries already in when this was written
//               (the field is saturated with irregardless, moist, queue,
//               literally, colonel, tomorrow and lisp)
//
// Candidates, scored by hand (see the CANDIDATES table below, the single
// source of truth): the field is saturated with irregardless, moist,
// queue, literally, colonel, tomorrow and lisp, so every one of those
// scores fresh 1-2 and loses. The winner:
//
//   forever  5/5/5 = 15 — the deletion undoes itself: erase "forever" and
//   nothing can last forever, including the erasure. The brief itself says
//   "erase from the dictionary forever", so the joke lands the instant the
//   word is read. Nearest rivals "yes" and "right" both reach 14: "yes" is
//   the mirror of "no", already in the field three times, and "right" needs
//   half a beat to unpack its three collapsing meanings.
//
// Deterministic: no randomness, no network, no input files. Node 22,
// standard library only.

import { mkdirSync, writeFileSync, chmodSync, readFileSync } from "node:fs";

type Candidate = {
  word: string;
  speed: number; // 0-5: joke lands at first sight
  intrinsic: number; // 0-5: humour from the word itself
  fresh: number; // 0-5: the field would not think of it first
  why: string;
};

const CANDIDATES: Candidate[] = [
  { word: "irregardless", speed: 5, intrinsic: 5, fresh: 1, why: "the obvious pick; dozens of entries already" },
  { word: "moist", speed: 5, intrinsic: 4, fresh: 1, why: "the ick word; dozens of entries already" },
  { word: "queue", speed: 5, intrinsic: 4, fresh: 1, why: "four silent letters; dozens of entries already" },
  { word: "literally", speed: 4, intrinsic: 4, fresh: 1, why: "misused to death; the field is full of it" },
  { word: "colonel", speed: 4, intrinsic: 4, fresh: 1, why: "spelled nothing like it sounds; field is full" },
  { word: "tomorrow", speed: 4, intrinsic: 4, fresh: 2, why: "nothing can wait any more; several entries" },
  { word: "lisp", speed: 4, intrinsic: 5, fresh: 2, why: "a word its sufferers cannot say; several entries" },
  { word: "unsubscribe", speed: 4, intrinsic: 3, fresh: 2, why: "you can never leave; a few entries" },
  { word: "bologna", speed: 4, intrinsic: 4, fresh: 5, why: "pronounced nothing like spelled, and slang for nonsense" },
  { word: "basically", speed: 4, intrinsic: 4, fresh: 4, why: "the filler everyone leans on" },
  { word: "maybe", speed: 4, intrinsic: 4, fresh: 5, why: "no more maybes, everyone must commit" },
  { word: "stop", speed: 4, intrinsic: 4, fresh: 5, why: "stop signs lose their word; nothing can stop" },
  { word: "impossible", speed: 4, intrinsic: 4, fresh: 5, why: "erase it and nothing is impossible any more" },
  { word: "yes", speed: 5, intrinsic: 4, fresh: 5, why: "nobody can ever say yes again; mirror of 'no', already in field" },
  { word: "never", speed: 4, intrinsic: 4, fresh: 5, why: "'never say never' dies with it" },
  { word: "right", speed: 4, intrinsic: 5, fresh: 5, why: "nothing is right, nobody can turn right, nobody can be right" },
  { word: "forever", speed: 5, intrinsic: 5, fresh: 5, why: "the deletion undoes itself: erase 'forever' and nothing can last forever, including the erasure" },
];

function score(c: Candidate): number {
  return c.speed + c.intrinsic + c.fresh;
}

// Highest total wins. Ties break toward the higher intrinsic score, then
// the shorter word, then the earliest entry in the table (explicit index,
// so the pick does not rely on sort stability). All deterministic.
function pick(cands: Candidate[]): Candidate {
  const ranked = cands
    .map((c, i) => ({ c, i }))
    .sort(
      (a, b) =>
        score(b.c) - score(a.c) ||
        b.c.intrinsic - a.c.intrinsic ||
        a.c.word.length - b.c.word.length ||
        a.i - b.i,
    );
  const winner = ranked[0].c;
  // The pick must be decisive, not a tie: the winner outscores the runner-up.
  if (ranked.length > 1 && score(winner) <= score(ranked[1].c)) {
    throw new Error("no decisive winner: top two candidates tie");
  }
  return winner;
}

function main(): void {
  const winner = pick(CANDIDATES);
  const word = winner.word;
  if (!/^[a-z]+$/.test(word)) throw new Error("entry must be one lowercase word");
  if (word.length < 1 || word.length > 77) throw new Error("entry must be 1-77 characters");
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", word, "utf8");
  chmodSync("/output/entry.txt", 0o644);
  // Read back what was written: the file must hold exactly the winning
  // word, nothing added around it.
  const back = readFileSync("/output/entry.txt", "utf8");
  if (back !== word) throw new Error(`entry.txt mismatch: wrote ${JSON.stringify(word)}, read ${JSON.stringify(back)}`);
  console.log(`winner: ${word} (score ${score(winner)}/15) chars: ${word.length}`);
  console.log(`audit: entry.txt is exactly ${JSON.stringify(back)}, ${Buffer.byteLength(back, "utf8")} bytes`);
}

main();
