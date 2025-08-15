import React from 'react';
import { 
  Award, 
  BookOpen, 
  Users, 
  Heart, 
  Globe,
  Shield,
  Lightbulb,
  Zap,
  Target,
  CheckCircle
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About AI Tutor
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              We're on a mission to revolutionize education through intelligent AI technology, 
              making quality learning accessible to everyone, everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                At AI Tutor, we believe that every student deserves access to personalized, 
                high-quality education. Our advanced AI technology breaks down barriers to learning, 
                providing instant, intelligent tutoring that adapts to each student's unique needs.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                We're not just building an educational platform – we're creating the future of learning, 
                where artificial intelligence empowers human potential and makes education more engaging, 
                effective, and accessible than ever before.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl p-8 h-80 flex items-center justify-center">
                <div className="text-6xl">🎯</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              These core principles guide everything we do at AI Tutor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Innovation
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We continuously push the boundaries of what's possible in education technology, 
                always seeking new ways to enhance the learning experience.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Empathy
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We understand that every student learns differently and faces unique challenges. 
                Our AI is designed with compassion and understanding.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Accessibility
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Quality education should be available to everyone, regardless of location, 
                background, or economic circumstances.
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Excellence
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We strive for excellence in everything we do, from our AI algorithms 
                to our user experience and customer support.
              </p>
            </div>

            {/* Value 5 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Trust
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We protect student privacy and data with the highest security standards, 
                building trust through transparency and reliability.
              </p>
            </div>

            {/* Value 6 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Focus
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We maintain laser focus on our core mission: helping students learn better, 
                faster, and more effectively through AI-powered education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-2xl p-8 h-80 flex items-center justify-center">
                <div className="text-6xl">📚</div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                AI Tutor was born from a simple observation: traditional education often fails 
                to meet students where they are. Founded by a team of educators, technologists, 
                and AI researchers, we recognized the immense potential of artificial intelligence 
                to personalize learning at scale.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                What started as a research project has evolved into a comprehensive platform 
                that serves thousands of students worldwide. Our AI doesn't just provide answers – 
                it understands context, adapts to learning styles, and guides students through 
                their educational journey.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Today, we continue to innovate and expand, always keeping our focus on what 
                matters most: helping students achieve their full potential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The brilliant minds behind AI Tutor's revolutionary platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl text-center shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">JD</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Dr. Jane Doe
              </h3>
              <p className="text-blue-600 dark:text-blue-400 mb-4">CEO & Co-Founder</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Former Stanford AI researcher with 15+ years in educational technology. 
                Passionate about democratizing quality education through AI.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl text-center shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">MS</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Michael Smith
              </h3>
              <p className="text-green-600 dark:text-green-400 mb-4">CTO & Co-Founder</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Machine learning expert and former Google engineer. Leads our AI development 
                team in creating cutting-edge tutoring algorithms.
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl text-center shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">SJ</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Dr. Sarah Johnson
              </h3>
              <p className="text-purple-600 dark:text-purple-400 mb-4">Head of Education</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Veteran educator with 20+ years in curriculum development. Ensures our AI 
                delivers pedagogically sound and effective learning experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Achievements
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Milestones that mark our journey toward educational excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Achievement 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">10,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Students Served</div>
            </div>

            {/* Achievement 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">95%</div>
              <div className="text-gray-600 dark:text-gray-300">Student Satisfaction</div>
            </div>

            {/* Achievement 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-300">Subjects Covered</div>
            </div>

            {/* Achievement 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">30+</div>
              <div className="text-gray-600 dark:text-gray-300">Countries Reached</div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Our Vision for the Future
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            We envision a world where every student has access to personalized, AI-powered education 
            that adapts to their unique learning style, helping them unlock their full potential 
            and achieve their dreams.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <CheckCircle className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Global Access</h3>
              <p className="text-blue-100">Quality education for every student, everywhere</p>
            </div>
            <div>
              <CheckCircle className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Continuous Innovation</h3>
              <p className="text-blue-100">Always evolving with the latest AI breakthroughs</p>
            </div>
            <div>
              <CheckCircle className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Student Success</h3>
              <p className="text-blue-100">Measurable improvement in learning outcomes</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
