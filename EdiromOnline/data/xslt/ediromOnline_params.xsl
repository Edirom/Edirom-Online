<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:eof="http://www.edirom.de/xslt/ediromOnlineFunctions" xmlns:mei="http://www.music-encoding.org/ns/mei" exclude-result-prefixes="xs" version="2.0" xml:space="default">

<!-- PARAMs ======================================================= -->
    <xsl:param name="lang">en</xsl:param>
    <xsl:param name="base" as="xs:string"/>
    <xsl:param name="pListKeyDelim">:</xsl:param>

<!-- VARIABLEs ======================================================= -->
    <xsl:variable name="masterFile" select="string('file')"/>
    <xsl:variable name="i18n" select="document(concat($base, 'tei/i18n.xml'))"/>
    <xsl:variable name="language">
        <xsl:choose>
            <xsl:when test="doc-available(concat($base, 'i18n/{$lang}.xml'))">
                <xsl:copy-of select="document(concat($base, 'i18n/{$lang}.xml'))"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:copy-of select="document(concat($base, 'i18n/en.xml'))"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <xsl:variable name="fallback">
        <xsl:choose>
            <xsl:when test="$lang eq 'en'"/>
            <xsl:otherwise>
                <xsl:copy-of select="document(concat($base, 'i18n/en.xml'))"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
</xsl:stylesheet>