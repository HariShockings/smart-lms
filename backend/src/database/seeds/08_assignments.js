export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('assignments').del();
  
  const courses = await knex('courses');
  
  const assignments = [];
  
  courses.forEach(course => {
    if (course.title === 'Introduction to Programming') {
      assignments.push(
        {
          course_id: course.id,
          title: 'Hello World Program',
          description: 'Create your first program that displays "Hello, World!" to the console. Include comments explaining each line of code.',
          points: 50,
          due_date: new Date('2023-09-30'),
          is_published: true
        },
        {
          course_id: course.id,
          title: 'Calculator Project',
          description: 'Build a simple calculator that can perform basic arithmetic operations (addition, subtraction, multiplication, division).',
          points: 100,
          due_date: new Date('2023-10-15'),
          is_published: true
        },
        {
          course_id: course.id,
          title: 'Array Manipulation',
          description: 'Write functions to sort, search, and manipulate arrays. Include at least 5 different array operations.',
          points: 75,
          due_date: new Date('2023-11-01'),
          is_published: true
        }
      );
    } else if (course.title === 'Web Development Fundamentals') {
      assignments.push(
        {
          course_id: course.id,
          title: 'Personal Portfolio Website',
          description: 'Create a responsive personal portfolio website using HTML, CSS, and JavaScript. Include at least 3 pages: Home, About, and Contact.',
          points: 150,
          due_date: new Date('2023-10-20'),
          is_published: true
        },
        {
          course_id: course.id,
          title: 'Interactive Form',
          description: 'Build an interactive contact form with validation using JavaScript. Include fields for name, email, phone, and message.',
          points: 100,
          due_date: new Date('2023-11-10'),
          is_published: true
        }
      );
    } else if (course.title === 'Introduction to Biology') {
      assignments.push(
        {
          course_id: course.id,
          title: 'Cell Structure Diagram',
          description: 'Create a detailed diagram of a plant and animal cell, labeling all major organelles and their functions.',
          points: 80,
          due_date: new Date('2023-10-05'),
          is_published: true
        },
        {
          course_id: course.id,
          title: 'Genetics Problem Set',
          description: 'Solve 10 genetics problems involving Punnett squares, inheritance patterns, and probability calculations.',
          points: 120,
          due_date: new Date('2023-10-25'),
          is_published: true
        }
      );
    }
  });
  
  return knex('assignments').insert(assignments);
}