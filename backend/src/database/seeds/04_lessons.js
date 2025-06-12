export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('lessons').del();
  
  const courses = await knex('courses');
  
  const lessons = [];
  
  courses.forEach(course => {
    if (course.title === 'Introduction to Programming') {
      lessons.push(
        {
          course_id: course.id,
          title: 'What is Programming?',
          content: 'An introduction to programming concepts, algorithms, and problem-solving techniques.',
          order: 1,
          type: 'text',
          duration_minutes: 45,
          is_published: true
        },
        {
          course_id: course.id,
          title: 'Variables and Data Types',
          content: 'Learn about different data types in JavaScript including strings, numbers, booleans, and objects.',
          order: 2,
          type: 'video',
          attachment_url: 'https://example.com/video1.mp4',
          duration_minutes: 60,
          is_published: true
        },
        {
          course_id: course.id,
          title: 'Control Structures',
          content: 'Understanding if statements, loops, and conditional logic in programming.',
          order: 3,
          type: 'interactive',
          duration_minutes: 75,
          is_published: true
        },
        {
          course_id: course.id,
          title: 'Functions and Methods',
          content: 'Creating reusable code with functions, parameters, and return values.',
          order: 4,
          type: 'text',
          duration_minutes: 50,
          is_published: true
        }
      );
    } else if (course.title === 'Web Development Fundamentals') {
      lessons.push(
        {
          course_id: course.id,
          title: 'HTML Basics',
          content: 'Introduction to HTML structure, tags, and semantic markup.',
          order: 1,
          type: 'text',
          duration_minutes: 40,
          is_published: true
        },
        {
          course_id: course.id,
          title: 'CSS Styling',
          content: 'Learn how to style web pages with CSS, including selectors, properties, and layouts.',
          order: 2,
          type: 'video',
          attachment_url: 'https://example.com/css-video.mp4',
          duration_minutes: 65,
          is_published: true
        },
        {
          course_id: course.id,
          title: 'JavaScript DOM Manipulation',
          content: 'Interactive web pages using JavaScript to manipulate the Document Object Model.',
          order: 3,
          type: 'interactive',
          duration_minutes: 80,
          is_published: true
        }
      );
    } else if (course.title === 'Introduction to Biology') {
      lessons.push(
        {
          course_id: course.id,
          title: 'Cell Structure and Function',
          content: 'Explore the basic unit of life - the cell, its organelles and their functions.',
          order: 1,
          type: 'text',
          duration_minutes: 50,
          is_published: true
        },
        {
          course_id: course.id,
          title: 'Genetics and Heredity',
          content: 'Understanding DNA, genes, and how traits are passed from parents to offspring.',
          order: 2,
          type: 'video',
          attachment_url: 'https://example.com/genetics-video.mp4',
          duration_minutes: 70,
          is_published: true
        },
        {
          course_id: course.id,
          title: 'Evolution and Natural Selection',
          content: 'The theory of evolution and how species change over time through natural selection.',
          order: 3,
          type: 'presentation',
          attachment_url: 'https://example.com/evolution-slides.pdf',
          duration_minutes: 55,
          is_published: true
        }
      );
    }
  });
  
  return knex('lessons').insert(lessons);
}