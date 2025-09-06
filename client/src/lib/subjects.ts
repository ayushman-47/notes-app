export const subjectMapping = {
  '1-8': [
    'Mathematics',
    'English', 
    'Hindi',
    'Bengali',
    'Science',
    'Social Science'
  ],
  '9-10': [
    'Mathematics',
    'English',
    'Hindi', 
    'Bengali',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Political Science',
    'Economics'
  ],
  '11-12': {
    'Science': ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
    'Commerce': ['Economics', 'Business Studies', 'Accountancy', 'Mathematics'],
    'Arts': ['History', 'Geography', 'Political Science', 'Economics', 'Sociology', 'Philosophy', 'Psychology', 'Social Science']
  }
};

export function getSubjectsForClass(classNumber: number): string[] {
  if (classNumber >= 1 && classNumber <= 8) {
    return subjectMapping['1-8'];
  } else if (classNumber >= 9 && classNumber <= 10) {
    return subjectMapping['9-10'];
  } else if (classNumber >= 11 && classNumber <= 12) {
    // For classes 11-12, return all subjects from all streams
    const subjects = [
      ...subjectMapping['11-12']['Science'],
      ...subjectMapping['11-12']['Commerce'],
      ...subjectMapping['11-12']['Arts']
    ];
    // Remove duplicates and return
    return [...new Set(subjects)];
  }
  return [];
}
