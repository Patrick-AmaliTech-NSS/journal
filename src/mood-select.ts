import { Mood } from "./types.js";

/**
 * Gets the icon path for a mood.
 * @param mood - Mood enum value
 * @returns Path to mood icon SVG
 */
export function getMoodIcon(mood: Mood): string {
  return `assets/icons/mood-${mood}.svg`;
}

/**
 * Gets the display label for a mood value.
 * @param mood - Mood enum value
 * @returns Human-readable mood label
 */
export function getMoodLabel(mood: Mood): string {
  const labels: Record<Mood, string> = {
    [Mood.HAPPY]: "Happy",
    [Mood.SAD]: "Sad",
    [Mood.MOTIVATED]: "Motivated",
    [Mood.STRESSED]: "Stressed",
    [Mood.CALM]: "Calm",
  };
  return labels[mood] ?? mood;
}

/**
 * Initializes mood select options with icons.
 * Creates custom option elements with icons for better visual appeal.
 */
export function initializeMoodSelectWithIcons(): void {
  const moodSelect = document.querySelector<HTMLSelectElement>("#entryMood");
  if (!moodSelect) {
    return;
  }

  // Clear existing options except the first one
  const firstOption = moodSelect.querySelector<HTMLOptionElement>("option[value='']");
  moodSelect.innerHTML = "";
  if (firstOption) {
    moodSelect.appendChild(firstOption);
  }

  // Add mood options with icons
  const moods: Mood[] = [
    Mood.HAPPY,
    Mood.SAD,
    Mood.MOTIVATED,
    Mood.STRESSED,
    Mood.CALM,
  ];

  moods.forEach((mood) => {
    const option = document.createElement("option");
    option.value = mood;
    option.textContent = getMoodLabel(mood);
    option.setAttribute("data-icon", getMoodIcon(mood));
    moodSelect.appendChild(option);
  });
}
