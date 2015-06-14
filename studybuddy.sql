-- phpMyAdmin SQL Dump
-- version 4.2.7
-- http://www.phpmyadmin.net
--
-- Host: localhost:3306
-- Generation Time: Jun 14, 2015 at 07:39 PM
-- Server version: 5.5.41-log
-- PHP Version: 5.6.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `studybuddy`
--

-- --------------------------------------------------------

--
-- Table structure for table `checklist_items`
--

CREATE TABLE IF NOT EXISTS `checklist_items` (
`checklist_item_id` int(11) NOT NULL,
  `task_id` int(11) DEFAULT NULL,
  `description` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `is_complete` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=3 ;

--
-- Dumping data for table `checklist_items`
--

INSERT INTO `checklist_items` (`checklist_item_id`, `task_id`, `description`, `is_complete`) VALUES
(1, 1, 'put your left foot in', 1),
(2, 1, 'put your left foot out', 1);

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE IF NOT EXISTS `subjects` (
`subject_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL,
  `colour` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL,
  `study_session_minutes` int(11) DEFAULT NULL,
  `short_break_minutes` int(11) DEFAULT NULL,
  `long_break_minutes` int(11) DEFAULT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=2 ;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`subject_id`, `user_id`, `name`, `colour`, `study_session_minutes`, `short_break_minutes`, `long_break_minutes`) VALUES
(1, 1, 'Irish', 'blue', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE IF NOT EXISTS `tasks` (
`task_id` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `title` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `description` varchar(2000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `assigned_date` date DEFAULT NULL,
  `time_estimation` int(11) DEFAULT NULL,
  `creation_date` timestamp NULL DEFAULT NULL,
  `status` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `status_change_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=2 ;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`task_id`, `subject_id`, `title`, `description`, `assigned_date`, `time_estimation`, `creation_date`, `status`, `status_change_date`) VALUES
(1, 1, 'read chapter 12', 'remember to write down all the words I don''t know', '2015-10-31', 90, '2015-06-14 15:14:06', 'done', '2015-06-14 19:01:06');

-- --------------------------------------------------------

--
-- Table structure for table `time_log`
--

CREATE TABLE IF NOT EXISTS `time_log` (
  `task_id` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `event_type` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `time_log`
--

INSERT INTO `time_log` (`task_id`, `timestamp`, `event_type`) VALUES
(1, '2015-06-14 19:12:52', 'stopped');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
`user_id` int(11) NOT NULL,
  `first_name` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `last_name` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `study_session_minutes` int(11) DEFAULT NULL,
  `short_break_minutes` int(11) DEFAULT NULL,
  `long_break_minutes` int(11) DEFAULT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=2 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `study_session_minutes`, `short_break_minutes`, `long_break_minutes`) VALUES
(1, 'Tali', 'Lavi', 'tali@lavi.fm', 25, 5, 15);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `checklist_items`
--
ALTER TABLE `checklist_items`
 ADD PRIMARY KEY (`checklist_item_id`), ADD KEY `task_id` (`task_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
 ADD PRIMARY KEY (`subject_id`), ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
 ADD PRIMARY KEY (`task_id`), ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `time_log`
--
ALTER TABLE `time_log`
 ADD KEY `task_id` (`task_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
 ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `checklist_items`
--
ALTER TABLE `checklist_items`
MODIFY `checklist_item_id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
MODIFY `subject_id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
MODIFY `task_id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `checklist_items`
--
ALTER TABLE `checklist_items`
ADD CONSTRAINT `checklist_items_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`);

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`);

--
-- Constraints for table `time_log`
--
ALTER TABLE `time_log`
ADD CONSTRAINT `time_log_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
