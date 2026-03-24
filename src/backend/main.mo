import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Common Types
  module VocabularyEntry {
    public type VocabularyEntry = {
      word : Text;
      definition : Text;
    };

    public func compareByWord(vocab1 : VocabularyEntry, vocab2 : VocabularyEntry) : Order.Order {
      Text.compare(vocab1.word, vocab2.word);
    };
  };

  public type DialogueLine = {
    speaker : Text;
    text : Text;
  };

  // Lesson Types
  public type Lesson = {
    title : Text;
    category : Text;
    difficulty : Text;
    dialogue : [DialogueLine];
    vocabulary : [VocabularyEntry.VocabularyEntry];
    grammarTips : Text;
  };

  module LessonQuiz {
    public type LessonQuiz = {
      lessonId : Nat;
      questions : [QuizQuestion.QuizQuestion];
    };

    public func compareByLessonId(quiz1 : LessonQuiz, quiz2 : LessonQuiz) : Order.Order {
      Nat.compare(quiz1.lessonId, quiz2.lessonId);
    };
  };

  public type QuizOption = {
    text : Text;
    isCorrect : Bool;
  };

  module QuizQuestion {
    public type QuizQuestion = {
      questionText : Text;
      options : [QuizOption];
    };

    public func compareByQuestionText(q1 : QuizQuestion, q2 : QuizQuestion) : Order.Order {
      Text.compare(q1.questionText, q2.questionText);
    };
  };

  module QuizSubmission {
    public type QuizSubmission = {
      lessonId : Nat;
      answers : [Nat]; // indexes of selected options
    };

    public func compareByLessonId(sub1 : QuizSubmission, sub2 : QuizSubmission) : Order.Order {
      Nat.compare(sub1.lessonId, sub2.lessonId);
    };
  };

  // User Types
  public type UserProgress = {
    completedLessons : [Nat];
    quizScores : [(Nat, Nat)]; // (lessonId, score)
    wordsLearned : [Text];
    streakDays : Nat;
    lastActiveDay : Time.Time;
  };

  module UserProfile {
    public type UserProfile = {
      name : Text;
      completedLessons : [Nat];
      wordsLearned : [Text];
      streakDays : Nat;
      lastActiveDay : Time.Time;
      quizScores : [(Nat, Nat)];
    };

    public func compareByName(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Text.compare(profile1.name, profile2.name);
    };
  };

  // Persistent State
  let lessons = Map.empty<Nat, Lesson>();
  let quizzes = Map.empty<Nat, LessonQuiz.LessonQuiz>();
  let userProgressMap = Map.empty<Principal, UserProgress>();
  let userProfiles = Map.empty<Principal, UserProfile.UserProfile>();

  // Access Control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management (Required by instructions)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile.UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile.UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile.UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Lesson Management
  public shared ({ caller }) func addLesson(lesson : Lesson) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = lessons.size() + 1;
    lessons.add(id, lesson);
    id;
  };

  // Public access - guests can browse lessons
  public query func getAllLessons() : async [Lesson] {
    lessons.values().toArray();
  };

  // Public access - guests can view individual lessons
  public query func getLesson(id : Nat) : async ?Lesson {
    lessons.get(id);
  };

  // Quiz Management
  public shared ({ caller }) func addQuiz(quiz : LessonQuiz.LessonQuiz) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    quizzes.add(quiz.lessonId, quiz);
  };

  // Public access - guests can view quizzes
  public query func getQuiz(lessonId : Nat) : async ?LessonQuiz.LessonQuiz {
    quizzes.get(lessonId);
  };

  // User Progress - requires user authentication
  public shared ({ caller }) func updateUserProgress(completedLessonId : Nat, learnedWords : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let now = Time.now();
    let previousProgress = switch (userProgressMap.get(caller)) {
      case (null) { emptyUserProgress(now) };
      case (?progress) { progress };
    };

    let updatedCompletedLessons = previousProgress.completedLessons.concat([completedLessonId]);
    let updatedWords = previousProgress.wordsLearned.concat(learnedWords);

    let streak = if (previousProgress.lastActiveDay + (3600 * 24 * 1_000_000_000) < now) {
      1;
    } else {
      previousProgress.streakDays + 1;
    };

    let newProgress : UserProgress = {
      completedLessons = updatedCompletedLessons;
      quizScores = previousProgress.quizScores;
      wordsLearned = updatedWords;
      streakDays = streak;
      lastActiveDay = now;
    };

    userProgressMap.add(caller, newProgress);
  };

  func scoreQuiz(answersIter : Iter.Iter<Nat>, questionsIter : Iter.Iter<QuizQuestion.QuizQuestion>) : Nat {
    switch (answersIter.next(), questionsIter.next()) {
      case (?answer, ?question) {
        let scoreRest = scoreQuiz(answersIter, questionsIter);
        if (answer < question.options.size() and question.options[answer].isCorrect) { scoreRest + 1 } else {
          scoreRest;
        };
      };
      case (_) { 0 };
    };
  };

  public shared ({ caller }) func submitQuiz(submission : QuizSubmission.QuizSubmission) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let correctAnswers = switch (quizzes.get(submission.lessonId)) {
      case (null) { Runtime.trap("Quiz does not exist for the provided lesson") };
      case (?quiz) { quiz.questions.sort(QuizQuestion.compareByQuestionText) };
    };

    let answersIter = submission.answers.values();
    let questionsIter = correctAnswers.values();

    let score = scoreQuiz(answersIter, questionsIter);

    var previousProgress = switch (userProgressMap.get(caller)) {
      case (null) { emptyUserProgress(Time.now()) };
      case (?progress) { progress };
    };
    let filteredScores = previousProgress.quizScores.filter(func((lessonId, _)) { lessonId != submission.lessonId });
    let newQuizScores = filteredScores.concat([(submission.lessonId, score)]);
    let newProgress : UserProgress = {
      completedLessons = previousProgress.completedLessons;
      quizScores = newQuizScores;
      wordsLearned = previousProgress.wordsLearned;
      streakDays = previousProgress.streakDays;
      lastActiveDay = previousProgress.lastActiveDay;
    };

    userProgressMap.add(caller, newProgress);
    score;
  };

  func emptyUserProgress(now : Time.Time) : UserProgress {
    {
      completedLessons = [];
      quizScores = [];
      wordsLearned = [];
      streakDays = 1;
      lastActiveDay = now;
    };
  };

  public query func getAllAvailableVocabularyByDifficulty() : async [Text] {
    if (lessons.size() == 0) { Runtime.trap("No available vocabularies") };
    lessons.values().toArray().map(func(lesson) { lesson.difficulty });
  };

  public query func getVocabularyByLesson(lessonId : Nat) : async [Text] {
    switch (lessons.get(lessonId)) {
      case (null) { Runtime.trap("Lesson does not exist") };
      case (?lesson) {
        if (lesson.vocabulary.size() == 0) {
          Runtime.trap("Lesson does not have vocabulary");
        };
        lesson.vocabulary.map(func(vocab) { vocab.word });
      };
    };
  };

  // User-only - requires authentication
  public query ({ caller }) func getCompletedLessonIds() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    switch (userProgressMap.get(caller)) {
      case (null) { [] };
      case (?progress) { progress.completedLessons };
    };
  };

  // User-only - requires authentication
  public shared ({ caller }) func deleteAccount() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    userProgressMap.remove(caller);
    userProfiles.remove(caller);
  };

  // User-only - requires authentication
  public query ({ caller }) func getQuizScore(lessonId : Nat) : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    switch (userProgressMap.get(caller)) {
      case (null) { null };
      case (?progress) {
        let foundScore = progress.quizScores.values().find(
          func((id, _)) { id == lessonId }
        );
        switch (foundScore) {
          case (null) { null };
          case (?(id, score)) { ?score };
        };
      };
    };
  };

  // User-only - requires authentication
  public query ({ caller }) func getUserProgress() : async UserProgress {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    switch (userProgressMap.get(caller)) {
      case (null) { emptyUserProgress(Time.now()) };
      case (?progress) { progress };
    };
  };

  func getSampleLessons() : [Lesson] {
    [
      {
        title = "Greetings";
        category = "Daily Life";
        difficulty = "Easy";
        dialogue = [
          { speaker = "A"; text = "Hello! How are you?" },
          { speaker = "B"; text = "I'm good, thank you. How about you?" },
          { speaker = "A"; text = "I'm fine, thanks!" },
        ];
        vocabulary = [
          { word = "Hello"; definition = "A greeting" },
          { word = "Thank you"; definition = "To express gratitude" },
        ];
        grammarTips = "Use 'How are you?' for greetings.";
      },
      {
        title = "Shopping";
        category = "Daily Life";
        difficulty = "Medium";
        dialogue = [
          { speaker = "A"; text = "Excuse me, how much is this shirt?" },
          { speaker = "B"; text = "It's $20." },
          { speaker = "A"; text = "I'll take it, please." },
        ];
        vocabulary = [
          { word = "Excuse me"; definition = "To get someone's attention" },
          { word = "How much"; definition = "To ask for price" },
        ];
        grammarTips = "Use 'How much is...' to ask for prices.";
      },
      {
        title = "A Day of Fishing";
        category = "Outdoor Activities";
        difficulty = "Medium";
        dialogue = [
          { speaker = "Tom"; text = "Good morning! Are you ready to go fishing?" },
          { speaker = "Jake"; text = "Yes! I've been looking forward to this all week. Did you bring the bait?" },
          { speaker = "Tom"; text = "Of course. I have worms and some artificial lures. What kind of fish are we trying to catch?" },
          { speaker = "Jake"; text = "I'm hoping to catch some bass. This lake is known for them." },
          { speaker = "Tom"; text = "Great. Let's cast our lines over by those reeds. Fish like to hide there." },
          { speaker = "Jake"; text = "Good idea. How do I attach the bait to the hook?" },
          { speaker = "Tom"; text = "Thread the worm onto the hook like this. Make sure it's secure so it doesn't fall off." },
          { speaker = "Jake"; text = "Got it. I'm going to cast now. How far should I throw?" },
          { speaker = "Tom"; text = "About 10 meters out. Then just wait patiently. Fishing requires a lot of patience." },
          { speaker = "Jake"; text = "I think I feel a bite! The line is moving!" },
          { speaker = "Tom"; text = "Don't pull yet — wait a second, then reel it in slowly and steadily." },
          { speaker = "Jake"; text = "I caught one! It's a bass! What do I do now?" },
          { speaker = "Tom"; text = "Hold it carefully and remove the hook. Are you going to keep it or release it?" },
          { speaker = "Jake"; text = "I'll release it. This was amazing! I want to try again." },
          { speaker = "Tom"; text = "That's the spirit! Fishing is relaxing and exciting at the same time." },
        ];
        vocabulary = [
          { word = "Bait"; definition = "Food or material used to attract fish onto a hook" },
          { word = "Hook"; definition = "A curved metal device attached to fishing line to catch fish" },
          { word = "Cast"; definition = "To throw the fishing line into the water" },
          { word = "Reel in"; definition = "To wind the fishing line back using a reel" },
          { word = "Bite"; definition = "When a fish takes the bait on the hook" },
          { word = "Lure"; definition = "An artificial bait designed to attract fish" },
          { word = "Bass"; definition = "A common freshwater fish popular among anglers" },
          { word = "Release"; definition = "To let the fish go back into the water after catching it" },
        ];
        grammarTips = "Present continuous (is/are + verb-ing) describes actions happening right now:\n- 'The line is moving!' (happening now)\n- 'I'm hoping to catch some bass.' (current desire)\n\nUse imperatives for instructions:\n- 'Cast the line.' / 'Wait patiently.' / 'Hold it carefully.'";
      },
    ];
  };

  func getSampleQuizzes() : [LessonQuiz.LessonQuiz] {
    [
      {
        lessonId = 1;
        questions = [
          {
            questionText = "What does 'Thank you' mean?";
            options = [
              { text = "A greeting"; isCorrect = false },
              { text = "Expressing gratitude"; isCorrect = true },
              { text = "Saying goodbye"; isCorrect = false },
            ];
          },
          {
            questionText = "Which is a greeting?";
            options = [
              { text = "Please"; isCorrect = false },
              { text = "Thank you"; isCorrect = false },
              { text = "Hello"; isCorrect = true },
            ];
          },
        ]
      },
      {
        lessonId = 2;
        questions = [
          {
            questionText = "What does 'Excuse me' mean?";
            options = [
              { text = "Asking for price"; isCorrect = false },
              { text = "Getting someone's attention"; isCorrect = true },
              { text = "Buying something"; isCorrect = false },
            ];
          },
          {
            questionText = "How do you ask for price?";
            options = [
              { text = "How much"; isCorrect = true },
              { text = "How old"; isCorrect = false },
              { text = "How tall"; isCorrect = false },
            ];
          },
        ]
      },
      {
        lessonId = 3;
        questions = [
          {
            questionText = "What is 'bait' used for in fishing?";
            options = [
              { text = "To hold the fishing rod"; isCorrect = false },
              { text = "To attract fish onto a hook"; isCorrect = true },
              { text = "To measure how deep the water is"; isCorrect = false },
            ];
          },
          {
            questionText = "What does 'reel in' mean?";
            options = [
              { text = "To throw the line into the water"; isCorrect = false },
              { text = "To release the fish back into the water"; isCorrect = false },
              { text = "To wind the fishing line back using a reel"; isCorrect = true },
            ];
          },
          {
            questionText = "Which sentence uses the present continuous correctly?";
            options = [
              { text = "The line moving!"; isCorrect = false },
              { text = "The line is moving!"; isCorrect = true },
              { text = "The line moved!"; isCorrect = false },
            ];
          },
        ]
      },
    ];
  };

  public shared ({ caller }) func loadSampleData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    for (lesson in getSampleLessons().values()) {
      let id = lessons.size() + 1;
      lessons.add(id, lesson);
    };

    for (quiz in getSampleQuizzes().values()) {
      quizzes.add(quiz.lessonId, quiz);
    };
  };
};
